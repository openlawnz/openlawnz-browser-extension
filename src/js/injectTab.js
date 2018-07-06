require('../css/injectTab.css')
const id = "openLawNZListItem"
const parentEl = document.querySelector('#legislationActions ul')

const openLawListItem = document.createElement('li')
const openLawButton = document.createElement('span')
// TODO: Set aria role to button
// We can't use a real button because the page is winforms
const openLawButtonContents = document.createElement('span')

openLawListItem.appendChild(openLawButton);
openLawButton.appendChild(openLawButtonContents);
parentEl.insertBefore(openLawListItem, parentEl.childNodes[2]);

openLawListItem.id = id

const openLawDialog = document.createElement('dialog')
const closeDialogButton = document.createElement('span')



openLawDialog.id = id + "-dialog"
document.body.appendChild(openLawDialog)

closeDialogButton.id = openLawDialog.id + "-close"
closeDialogButton.innerHTML = '&times;'

closeDialogButton.onclick = () => {
    openLawDialog.close();
}

openLawListItem.onclick = () => {
    openLawDialog.innerHTML = `
    <p>OpenLaw NZ references</p>
    <table>
        <thead>
            <tr>
                <th>Case name</th>
                <th>Citation</th>
                <th>Reference count</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Case name</td>
                <td>Citation 123</td>
                <td>5</td>
            </tr>
            <tr>
                <td>Case name</td>
                <td>Citation 123</td>
                <td>5</td>
            </tr>
        </tbody>
    </table>
    `
    
    openLawDialog.appendChild(closeDialogButton)
    openLawDialog.showModal()
}