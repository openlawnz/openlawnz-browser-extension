const TITLE_SELECTOR = "h1:not(.title)";
const SECTION_SELECTOR = "div.prov[id]";
const SECTION_HEADING_SELECTOR = "h5.prov";
const SECTION_LABEL_SELECTOR = "h5.prov > span.label";
const BUTTON_CLASS = "openlaw-btn";
const DIALOG_ID = "openLawNZListItem-dialog";

function makeRow(data) {
	const tr = document.createElement("tr");

	const caseName = document.createElement("td");
	caseName.classList.add("case_name");
	const caseLink = document.createElement("a");
	const caseUrl =
		data.case.caseCitations.length > 0
			? "https://www.openlaw.nz/case/" + data.case.caseCitations[0].id
			: "";
	if (data.case.caseCitations.length > 0) {
		caseLink.setAttribute("href", caseUrl);
	}
	caseLink.setAttribute("target", "_blank");
	caseLink.setAttribute("rel", "noopener");
	caseLink.textContent = data.case.caseName;
	caseName.appendChild(caseLink);
	tr.appendChild(caseName);

	const caseCitation = document.createElement("td");
	caseCitation.classList.add("case_citation");
	caseCitation.textContent =
		data.case.caseCitations.length > 0
			? data.case.caseCitations[0].citation
			: "Unknown";
	tr.appendChild(caseCitation);

	const count = document.createElement("td");
	count.classList.add("count");
	count.textContent = data.count;
	tr.appendChild(count);

	return tr;
}

const formatQuery = (legislationTitle, section) => {
	return `{
		legislation(title: "${legislationTitle}") {
			legislationToCases(condition: {section: "${section}"}) {
				caseId,
				count,
				section,
				case {
					caseName,
					caseCitations {
						citation,
						id
					}
				}
			}
		}

    }`;
};

let dialogEl = null;
let dialogContentEl = null;

function ensureDialog() {
	if (dialogEl && document.body.contains(dialogEl)) return;

	dialogEl = document.createElement("dialog");
	dialogEl.id = DIALOG_ID;

	dialogContentEl = document.createElement("div");
	dialogContentEl.id = DIALOG_ID + "-wrap";

	const closeBtn = document.createElement("span");
	closeBtn.id = DIALOG_ID + "-close";
	closeBtn.innerHTML = "&times;";
	closeBtn.onclick = () => dialogEl.close();

	dialogEl.appendChild(dialogContentEl);
	dialogEl.appendChild(closeBtn);
	document.body.appendChild(dialogEl);
}

function renderResults(tableData) {
	dialogContentEl.innerHTML =
		'<p id="openLawNZListItem-header">Cases that refer to this section</p>';

	if (tableData.length > 0) {
		dialogContentEl.innerHTML += `
			<table>
				<thead>
					<tr>
						<th class="case_name_col_head">Case name</th>
						<th class="case_citation_col_head">Citation</th>
						<th class="count_col_head">Count</th>
					</tr>
				</thead>
				<tbody id="openLawNZDialog-body"></tbody>
			</table>
		`;
		const tbody = dialogContentEl.querySelector("#openLawNZDialog-body");
		tableData.forEach((caseReference) => {
			tbody.appendChild(makeRow(caseReference));
		});
	} else {
		dialogContentEl.innerHTML += `<p id="${DIALOG_ID}-no-results">No results found</p>`;
	}

	dialogContentEl.innerHTML += `<div id="openLawNZListItem-powered-by">
		<p>Powered by</p>
		<a href="https://www.openlaw.nz" target="_blank" rel="noopener">OpenLaw NZ Free API</a>
		<p id="openlawNZDisclaimer">This data is automatically extracted from PDF files. While OpenLaw NZ makes every effort to provide accurate data, it is not something we can guarantee.</p>
	</div>`;
}

function openDialogFor(legislationTitle, section) {
	ensureDialog();
	dialogContentEl.innerHTML =
		'<p id="openLawNZListItem-header">Loading…</p>';
	dialogEl.showModal();

	fetch("https://api.openlaw.nz/graphql", {
		method: "POST",
		body: JSON.stringify({
			query: formatQuery(legislationTitle, section),
		}),
		headers: {
			"Content-Type": "application/json",
		},
	})
		.then((response) => response.json())
		.then((response) => {
			const tableData =
				(response.data &&
					response.data.legislation &&
					response.data.legislation.legislationToCases) ||
				[];
			renderResults(tableData);
		})
		.catch(() => {
			dialogContentEl.innerHTML = `<p id="${DIALOG_ID}-no-results">Could not contact the OpenLaw API.</p>`;
		});
}

function buildButton(legislationTitle, sectionNumber) {
	const btn = document.createElement("button");
	btn.type = "button";
	btn.className = BUTTON_CLASS;
	btn.setAttribute(
		"aria-label",
		`View OpenLaw cases that cite section ${sectionNumber}`
	);
	btn.title = `View OpenLaw cases that cite section ${sectionNumber}`;
	btn.dataset.title = legislationTitle;
	btn.dataset.section = sectionNumber;

	const icon = document.createElement("span");
	icon.className = BUTTON_CLASS + "__icon";
	icon.style.backgroundImage = `url(${chrome.runtime.getURL("logo.png")})`;
	btn.appendChild(icon);

	btn.addEventListener("click", (e) => {
		e.preventDefault();
		e.stopPropagation();
		openDialogFor(btn.dataset.title, btn.dataset.section);
	});

	return btn;
}

function getLegislationTitle() {
	const el = document.querySelector(TITLE_SELECTOR);
	return el ? el.innerText.trim() : null;
}

function injectButtons() {
	const legislationTitle = getLegislationTitle();
	if (!legislationTitle) return;

	document.querySelectorAll(SECTION_SELECTOR).forEach((section) => {
		const heading = section.querySelector(SECTION_HEADING_SELECTOR);
		const labelEl = section.querySelector(SECTION_LABEL_SELECTOR);
		if (!heading || !labelEl) return;
		if (heading.querySelector("." + BUTTON_CLASS)) return;

		const sectionNumber = labelEl.innerText.trim();
		if (!sectionNumber) return;

		heading.appendChild(buildButton(legislationTitle, sectionNumber));
	});
}

injectButtons();

document.addEventListener("turbo:render", injectButtons);
document.addEventListener("turbo:load", injectButtons);

const observer = new MutationObserver(() => injectButtons());
observer.observe(document.body, { childList: true, subtree: true });
