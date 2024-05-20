// Used to scrape Roster info from TeamSnap (https://go.teamsnap.com/1234567/roster/list)
// Open up console in the browser and paste the following
// Then copy the resulting csv log and paste into a new file

const nameHeader = 'Name';
const emailHeader = 'E-mail Address';
const phoneHeader = 'Home Phone';
const phoneHeader2 = 'Home Phone 2';
const playerHeader = 'Children';
const roleHeader = 'Role';
const jerseyHeader = 'Jersey Number';
const positionHeader = 'Position';
const phoneNumber = 'Phone';

/** Get a single contact info for a player */
function getContactInfo(x) {
    let info = { [nameHeader]: '', [emailHeader]: '', [phoneHeader]: '', [phoneHeader2]: '' };

    if (x.children.length === 0)
        return info;

    // A contact info is a Name (required), Email (if they have that), Phone Number (if present), Second Phone Number (if present)
    try {
        const contactChildren = [...x.children];

        // First child is pretty much guaranteed to be the name, set that and remove the entry
        info[nameHeader] = contactChildren[0].innerText;
        contactChildren.shift();

        // The rest of the children will be the email (0 or 1) or phone number(s) (0 or several, we're just going to grab 2)
        const contactDetail = contactChildren
            .map(getContactDetail)
            .filter(x => x);

        for (const detail of contactDetail) {
            // If we have an email, add it to our info
            if (Object.keys(detail).includes(emailHeader))
                info = { ...info, ...detail };

            // If we have a phone number, add it to our info.
            // Handle 2 phone numbers. Dedupe them.
            if (Object.keys(detail).includes(phoneNumber))
                setPhoneInfo(info, detail[phoneNumber]);
        }
    }
    catch (e) {
        console.error(e);
    }
    return info;
}

/** Figure out if this is a phone number or email and return it */
function getContactDetail(x) {
    if (isEmail(x))
        return { [emailHeader]: getEmailInfo(x) }

    if (isPhoneNumber(x))
        return { [phoneNumber]: getPhoneInfo(x) }

    return undefined;
}

/** Determine if a Contact detail is an email */
function isEmail(x) {
    // <a href="mailto:foo@gmail.com">foo@gmail.com</a>
    return x.innerHTML.includes('mailto');
}

/** Determine if a Contact detail is a phone number */
function isPhoneNumber(x) {
    // A phone number begins with a number, +, (
    // Not the best way to determine, but if it's not an email, it's pretty much a phone number or a name
    return /^([\d\+(])/.test(x.innerText);
}

/** Return the email address for a given node */
function getEmailInfo(x) {
    // console.log(x.innerText);
    // console.log(x.innerHTML);
    // x.children[1].children[0].innerText;
    return x.children[0].innerText;
}

/** Return the normalized phone number for a given node */
function getPhoneInfo(x) {
    // E.g. '619-555-1212<b> - Dad</b>
    var phone = x.innerHTML.split('<')[0]; // just get the phone number, not the " - foo" designation
    phone = phone.replaceAll(/[+ ()-.]/g, ''); // remove all the symbols from phone number
    if (phone.startsWith('1'))
        phone = phone.slice(1); // remove any '1' ('+1') country code prefixes
    phone = `${phone.substring(0, 3)}-${phone.substring(3, 6)}-${phone.substring(6)}`; // normalize the phone number (assumes US, 10 digits)
    return phone;
}

/** Sets the discovered contact detail phone number into our `info` object */
function setPhoneInfo(info, phoneNumber) {
    // If we haven't set the first phone number column, then set that one
    if (!info[phoneHeader]) {
        info[phoneHeader] = phoneNumber;
        return;
    }

    // Is this a duplicate phone from the first one already? Do nothing
    if (info[phoneHeader] === phoneNumber)
        return;

    // If we haven't set the second phone number column, then set that one
    if (!info[phoneHeader2]) {
        info[phoneHeader2] = phoneNumber;
        return;
    }

    // Ignore if we have more than two phone numbers already
}

/** Given a player row, find their info (name, role, jersey #, position) */
function getPlayerInfo(x) {
    const info = { [playerHeader]: '', [roleHeader]: '', [jerseyHeader]: '', [positionHeader]: '' };

    const nameNode = x.querySelector('.u-size3of12');

    // Player Name
    info[playerHeader] = nameNode.querySelector('.u-padRightXs').innerText;

    // Team title (e.g. Team Owner, Team Manager). Usually does not exist for players.
    info[roleHeader] = nameNode.querySelector('p')?.innerText ?? '';

    const playerDetail = x.querySelector('.u-size2of12');

    // E.g. "#1 - Goalkeeper" (Both are optional)
    const detailText = playerDetail.innerText;
    const details = detailText.split(' - ');

    // Jersey Number
    if (details[0].startsWith('#')) {
        info[jerseyHeader] = details[0].slice(1); // Remove the "#" symbol.
    }
    // Position
    else if (details[0]) {
        info[positionHeader] = details[0];
    }

    // Position
    if (details.length > 1) {
        info[positionHeader] = details[1];
    }

    return info;
}

/** Takes a player row. This gives us the player name/info and their parent's contact info. */
function getPlayer(x) {
    try {
        const playerInfo = getPlayerInfo(x);
        const contacts = [...x.querySelectorAll('.u-spaceEndsXs')].map(getContactInfo);
        const contactsInfo = contacts.map(c => {
            const pi = structuredClone(playerInfo);

            // If this contact has the same name as the player, then it's the player themselves.
            // They are not their own child, so unset that.
            if (c[nameHeader] === pi[playerHeader])
                pi[[playerHeader]] = '';
            return ({ ...c, ...pi });
        }
        );

        return contactsInfo;

    } catch (e) { }
}

// Thanks: https://stackoverflow.com/a/58769574
function objectToCsv(arr) {
    // Get the keys of the object and put that as a header line at top of the array
    // This depends on the first entry having all the keys.
    const array = [Object.keys(arr[0])].concat(arr);

    // Write each value on a line
    // This depends on every entry having the same set of key-values
    return array.map(it => {
        return Object.values(it).join(',');
    }).join('\n');
}

// Just contact info, no player info
// roster = [...document.querySelectorAll('.u-spaceEndsXs')].map(getContactInfo);

// Get rows of all the players (and coach, managers) (filter out the header rows (undefined))
const roster = [...document.querySelectorAll('.Panel-row--withCells')]
    .flatMap(getPlayer)
    .filter(x => x);

// Outlook .csv headers: Name,First Name,Middle Name,Last Name,E-mail Address,E-mail Type,Home Phone,Mobile Phone,Children,Job Title,Keywords (label?),Web Page (the TS Roster URL?)

// Outlook .csv format
console.log('=============================================================================');
console.log('================================================== Copy starting next line');
console.log(objectToCsv(roster));
console.log('================================================== Copy stopping previous line');
console.log('=============================================================================');
