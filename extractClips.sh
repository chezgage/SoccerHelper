#!/bin/sh

# Script to cut up video files using ffmpeg tools
# Used for getting highlight clips from a (sports) video file

# First, install 'ffmpeg'
# MacOs: brew install ffmpeg
# Windows: TBD

# Extracts a small clip from a specified input video file
# Args:
#   $1 - Input file path/name
#   $2 - Start timestamp (mm:ss)
#   $3 - End timestamp (mm:ss)
#   $4 - Output file desc. Full output file is '${filePrefix}_${4}_${fileNo}.mp4'
# Global Args:
#   $filePrefix - Prefix for output file name
#   $fileNo - File number suffix for output file name. Auto increments. Default (if not specified) is 0 (zero)
ExtractClip() {
    # echo file input is $1
    # echo start is $2
    # echo end is $3
    # echo clip type is $4

    # Increment number and pad to 2 digits
    printf -v num "%02d" $((fileNo++))
    outputFile=${filePrefix}_${num}_${4}.mp4
    # echo file output is $outputFile

    # https://superuser.com/questions/138331/using-ffmpeg-to-cut-up-video
    # https://trac.ffmpeg.org/wiki/Seeking
    # Input seeking, before the `-i` file name -- fast
    # the `-c copy` is there to avoid a reencode (slow, but may be "better")
    # -y: overwrite output files
    cmd="ffmpeg -ss $2 -to $3 -i $1 -c copy $outputFile -y -loglevel warning"

    # Sample ways to call and extract a clip.
    # ffmpeg -ss 1:35 -i GX010017.MP4 -t 10 -c copy pass01a.mp4 # Good: starts at 1:35 and goes for 10s
    # ffmpeg -ss 1:35 -i GX010017.MP4 -to 1:45 -c copy -copyts pass01b.mp4 # Bad: Black at start till 1:35, then video till 1:45 in original, so yes the right 10s of video, but the leading black _for_ 1:35 is silly
      # see `setpts=PTS-STARTPTS` to adjust the timestamp in this situation
    # ffmpeg -ss 1:35 -i GX010017.MP4 -to 0:10 -c copy pass01c.mp4 # Good: starts at 1:35 and goes to 0:10s into the new file
    # ffmpeg -ss 1:35 -i GX010017.MP4 -to 1:45 -c copy pass01d.mp4 # Bad: starts at 1:35 and goes _for_ 1:45 more ... ending at 3:20 in original
      # see '-copyts' to not reset the timestamp from the '-ss' starting point
    # ffmpeg -ss 1:35 -to 1:45 -i GX010017.MP4 -c copy pass01e.mp4 # Good: starts at 1:35, ends at 1:45 (total of 10s) in original time measurements

    echo Running command: $cmd
    # eval ${cmd}
}

filePrefix=2024-04-17-OpponentName
fileNo=0

# ======================================================= Example Usage
# ExtractClip GX010018.MP4 03:00 03:08 1v1
# ExtractClip GX010018.MP4 04:25 04:35 claim
# ExtractClip GX010018.MP4 07:01 07:23 deflection
# ExtractClip GX010018.MP4 08:16 08:25 save
# ExtractClip GX010018.MP4 08:36 08:46 pass
