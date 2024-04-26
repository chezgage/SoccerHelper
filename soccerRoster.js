// Used to scrape Roster info from TeamSnap (https://go.teamsnap.com/1234567/roster/list)
// Open up console in the browser and paste the following

const nameHeader = "Name";
const emailHeader = "E-mail Address";
const phoneHeader = "Home Phone";


function getPerson(x) {
    p = {[nameHeader]:'', [emailHeader]:'', [phoneHeader]:''};
    try {        
        if (x.children.length >= 1) {
           p[nameHeader] = x.children[0].innerText;
        }

        if (x.children.length >= 2) {
           p[emailHeader] = x.children[1].children[0].innerText;
        }

        if (x.children.length >= 2) {
            p[phoneHeader] = x.children[2].innerHTML.split('<')[0]; // just get the phone number, not the " - foo" designation
			p[phoneHeader] = p[phoneHeader].replaceAll(/[-\() +]/g, ''); // remove all the symbols from phone number
            if (p[phoneHeader][0] == '1')
                p[phoneHeader] = p[phoneHeader].slice(1);
			p[phoneHeader] = `${p[phoneHeader].substring(0,3)}-${p[phoneHeader].substring(3, 6)}-${p[phoneHeader].substring(6)}`; // normalize the phone number
        }
    }
    catch(e) {}
    return p;
}

roster = [...document.querySelectorAll('.u-spaceEndsXs')].map(getPerson);

// Outlook .csv format
console.log('Name,E-mail Address,Home Phone');
roster.forEach(x=>{console.log(`${x[nameHeader]},${x[emailHeader]},${x[phoneHeader]}`);})
