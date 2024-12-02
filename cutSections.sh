#!/bin/sh

# Script to cut out sections from video files using ffmpeg tools
# Used for cutting out sections from (sports) video file. 
# Like cutting beginning, halftime, ending from the file before uploading just the active game periods.

# First, install 'ffmpeg'
# MacOs: brew install ffmpeg
# Windows: TBD


# Goal: do this without re-encoding the video
# - this keeps it fast
# - does mean that we can only cut at nearest key frames

# We can just make it such that we can cut out any single section (from start, middle, end)
# and we can run that a couple times till we're done

# Or, we can make it a bit fancier and take multiple "cut" sections at one go

# We can also just cut out a section we want to keep and then concat those sections back together.

# https://superuser.com/questions/681885/how-can-i-remove-multiple-segments-from-a-video-using-ffmpeg


# LAFC file
#  start:    1:04
#  end:     41:15
#  start:   54:19
#  end:   1:34:25





ffmpeg -i in.mp4 -filter_complex \
"[0:v]trim=duration=30[a]; \
 [0:v]trim=start=40:end=50,setpts=PTS-STARTPTS[b]; \
 [a][b]concat[c]; \
 [0:v]trim=start=80,setpts=PTS-STARTPTS[d]; \
 [c][d]concat[out1]" -map '[out1]' out.mp4

# Works, but re-encodes, so is slow
ffmpeg -i in5.mp4 -filter_complex \
"[0:v]trim=start=60:end=120,setpts=PTS-STARTPTS[a]; \
 [0:v]trim=start=240:end=360,setpts=PTS-STARTPTS[b]; \
 [a][b]concat[out1]" -map '[out1]' -y out.mp4


# Looks like we can't do a filterspec and a stream copy. So, this may not ever work out in just one command.
# [vost#0:0 @ 0x131e06530] Streamcopy requested for output stream fed from a complex filtergraph. Filtering and streamcopy cannot be used together.


ffmpeg -i in.mp4 -filter_complex \
"[0:v]trim=start=01:04:end=41:15,setpts=PTS-STARTPTS; \
 [0:a]atrim=sstart=01:04:end=41:15,asetpts=PTS-STARTPTS[0a]; \
 [0:v]trim=start=54:19:end=01:34:25,setpts=PTS-STARTPTS; \
 [0:a]atrim=start=54:19:end=01:34:25,asetpts=PTS-STARTPTS[1a]; \
 [0v][0a][1v][1a]concat=n=2:v=1:a=1[outv][outa]" \
 -map [outv] -map [outa] out.mp4


# works, but re-encodes so that's not good
ffmpeg \
  -ss 01:04 -to 02:04 -i in5.mp4 \
  -ss 3:30 -to 4:37 -i in5.mp4 \
  -filter_complex '[0:v][1:v]concat=n=2:v=1[outv]' \
  -map '[outv]' -y out.mp4


# Commands from https://github.com/mifi/lossless-cut
# Basically, cuts out the selected segments and concats them.
ffmpeg -hide_banner 
    -ss '3258.62389' -i '/Users/jadgage/Downloads/in.mp4' -t '2407.20930' 
    -avoid_negative_ts make_non_negative 
    -map '0:0' '-c:0' copy 
    -map '0:1' '-c:1' copy 
    -map_metadata 0 
    -movflags '+faststart' -default_mode infer_no_subs -ignore_unknown -f mov -y '/Users/jadgage/Downloads/in-00.54.18.624-01.34.25.833-seg2.mov'

ffmpeg -hide_banner 
    -ss '63.75932' -i '/Users/jadgage/Downloads/in.mp4' -t '2412.92062' 
    -avoid_negative_ts make_non_negative 
    -map '0:0' '-c:0' copy 
    -map '0:1' '-c:1' copy 
    -map_metadata 0 
    -movflags '+faststart' -default_mode infer_no_subs -ignore_unknown -f mov -y '/Users/jadgage/Downloads/in-00.01.03.759-00.41.16.680-seg1.mov'

echo -e 
    "file 'file:/Users/jadgage/Downloads/in-00.01.03.759-00.41.16.680-seg1.mov'\n
    file 'file:/Users/jadgage/Downloads/in-00.54.18.624-01.34.25.833-seg2.mov'"
    | ffmpeg -hide_banner -f concat -safe 0 -protocol_whitelist 'file,pipe,fd' -i - 
        -map '0:0' '-c:0' copy '-disposition:0' default 
        -map '0:1' '-c:1' copy '-disposition:1' default 
        -movflags '+faststart' -default_mode infer_no_subs -ignore_unknown -f mov -y '/Users/jadgage/Downloads/in-cut-merged-1732748172229.mov'

