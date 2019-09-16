const legislationTitle = document.getElementById("ctl00_Cnt_documentNavigationHeader_documentTitle").innerText;
const sectionEl = document.querySelector("#legislation .label");
const section = sectionEl ? sectionEl.innerText : null;

function makeRow(data) {
	var tr = document.createElement("tr");
	var case_name = document.createElement("td");
	case_name.classList.add("case_name");
	var case_link = document.createElement("a");
	case_link.setAttribute("href", "https://www.openlaw.nz/case/" + data.caseId);
	case_link.setAttribute("target", "_blank");
	case_link.setAttribute("rel", "noopener");
	case_link.textContent = data.case.caseName;
	case_name.appendChild(case_link);
	tr.appendChild(case_name);

	var case_citation = document.createElement("td");
	case_citation.classList.add("case_citation");
	case_citation.textContent = data.case.caseCitations.length > 0 ? data.case.caseCitations[0].citation : "Unknown";
	tr.appendChild(case_citation);

	var count = document.createElement("td");
	count.classList.add("count");
	count.textContent = data.count;
	tr.appendChild(count);

	var extraction_confidence = document.createElement("td");
	extraction_confidence.classList.add("count");
	extraction_confidence.textContent = (data.case.extractionConfidence / 2) * 100 + "%";
	tr.appendChild(extraction_confidence);

	return tr;
}

if (section) {
	const id = "openLawNZListItem";
	const parentEl = document.querySelector("#legislationActions ul");

	const openLawListItem = document.createElement("li");
	const openLawButton = document.createElement("span");

	// TODO: Set aria role to button
	// We can't use a real button because the page is winforms
	const openLawButtonContents = document.createElement("span");
	openLawButtonContents.style.backgroundImage = `url(${chrome.runtime.getURL("logo.png")})`;

	openLawListItem.appendChild(openLawButton);
	openLawButton.appendChild(openLawButtonContents);
	parentEl.insertBefore(openLawListItem, parentEl.childNodes[2]);

	openLawListItem.id = id;

	const openLawDialog = document.createElement("dialog");
	const closeDialogButton = document.createElement("span");
	const dialogContent = document.createElement("div");

	openLawDialog.id = id + "-dialog";
	document.body.appendChild(openLawDialog);

	closeDialogButton.id = openLawDialog.id + "-close";
	closeDialogButton.innerHTML = "&times;";

	closeDialogButton.onclick = () => {
		openLawDialog.close();
	};
	dialogContent.id = openLawDialog.id + "-wrap";
	openLawDialog.appendChild(dialogContent);
	openLawDialog.appendChild(closeDialogButton);

	openLawListItem.onclick = () => {
		fetch(`https://api.openlaw.nz/graphql`, {
			method: "POST",
			body: JSON.stringify({
				query: formatQuery(legislationTitle, section)
			}),
			headers: {
				"Content-Type": "application/json"
			}
		}).then(response => {
			response.json().then(response => {
				let tableData = response.data.getLegistlationByTitle.legislationToCases.sort(
					(a, b) => b.case.extractionConfidence - a.case.extractionConfidence
				);
				dialogContent.innerHTML = '<p id="openLawNZListItem-header">Cases that refer to this section</p>';
				if (tableData.length > 0) {
					dialogContent.innerHTML += `
                    <table>
                        <thead>
                            <tr>
                                <th class="case_name_col_head">Case name</th>
                                <th class="case_citation_col_head">Citation</th>
                                <th class="count_col_head">Count</th>
                                <th class="extraction_col_head">Confidence</th>
                            </tr>
                        </thead>
                        <tbody id="openLawNZDialog-body"></tbody>
                    </table>
                    `;

					const tbody = dialogContent.querySelector("#openLawNZDialog-body");

					tableData.forEach(caseReference => {
						tbody.appendChild(makeRow(caseReference));
					});
				} else {
					dialogContent.innerHTML = `<p id="${openLawDialog.id}-no-results">No results found</p>`;
				}

				dialogContent.innerHTML += `<div id="openLawNZListItem-powered-by">
                <p>Powered by</p>
                <a href="https://www.openlaw.nz" target="_blank" rel="noopener">OpenLaw NZ Free API
                </a>`;
			});
		});

		openLawDialog.showModal();
	};
}

const formatQuery = (legislationTitle, section) => {
	return `{ 
		getLegistlationByTitle(_title: "${legislationTitle}") {
			legislationToCases(condition: {section: "${section}"}) {
				caseId,
				count,
				section,
				case {
					extractionConfidence,
					caseName,
					caseCitations {
						citation
					}
				}
			}
		}
			  
    }`;
};
