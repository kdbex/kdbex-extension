export default defineContentScript({
  matches: ["*://*/*"],
  main() {
    const matches = parseElement(document.body);
    if (matches instanceof Array) {
      matches.forEach((match) => decorateMatch(match));
    }
    const forms = matches instanceof Array ? matches.length : 0;
    sendMessage('setTabInfo', {
      forms: forms,
      url: getBaseUrl(document.location.href)
    })
  },
});

function px(value: number): string {
  return `${value}px`;
}

function getBaseUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.hostname}`;
  } catch (error) {
    return ""; // Invalid URL
  }
}

function decorateMatch(match: Match) {
  const button = match.button!!;
  const boundingRect = button.getBoundingClientRect();
  const child = document.createElement("img");
  child.src = browser.runtime.getURL("/icon/icon.png");
  child.height = boundingRect.height;
  child.width = boundingRect.height;
  child.style.left = px(boundingRect.x + boundingRect.width + 5);
  child.style.top = px(boundingRect.y);
  child.style.position = "absolute";
  child.onclick = () => {
    let pwField =
      match.fields.find((elt) => elt.type === "password") !== undefined;
    let userField =
      match.fields.find((elt) => elt.type !== "password") !== undefined;
    console.log(
      "url: ",
      document.location.href,
      "pwField: ",
      pwField,
      "userField: ",
      userField
    );
    const code = (pwField ? 2 : 0) + (userField ? 1 : 0);
    /*sendMessage("queryTabData", {
      code: code,
      url: getBaseUrl(document.location.href),
    }).then((entry) => {
      if (entry) {
        match.fields.forEach((field) => {
          if (field.type == "password") {
            field.value = entry.password;
          } else {
            field.value = entry.username!!;
          }
        });
      }
    });*/
  };
  document.body.appendChild(child);
}

interface Match {
  button: HTMLButtonElement | undefined;
  fields: HTMLInputElement[];
}

const buttonTextSearch = [
  "suivant",
  "continuer",
  "next",
  "continue",
  "valider",
  "validate",
  "submit",
  "envoyer",
  "connect",
  "connexion",
];

function textSearch(text: string): boolean {
  return (
    buttonTextSearch.find((elt) => text.toLowerCase().includes(elt)) !=
    undefined
  );
}

function detectButton(elt: HTMLElement): boolean {
  return (
    (elt instanceof HTMLButtonElement ||
      (elt.getAttribute("onclick") !== null && elt.role === "button")) &&
    textSearch(elt.innerText) &&
    isVisible(elt)
  );
}

function detectField(elt: HTMLElement): boolean {
  const bounding = elt.getBoundingClientRect();
  return (
    elt instanceof HTMLInputElement &&
    elt.type !== "hidden" &&
    isVisible(elt) &&
    bounding.width > 0 &&
    bounding.height > 0
  );
}

function isVisible(elt: HTMLElement): boolean {
  return elt.style.display !== "none" && elt.style.visibility !== "hidden" && elt.ariaHidden !== "true";
}

/**
 * A recursive function that parses an HTMLElement to return matches
 * Concepts:
 *
 * @param body
 * @returns
 */
function parseElement(body: HTMLElement): Match | Match[] {
  let levelMatch: Match = {
    button: undefined,
    fields: [],
  };
  let matchsGathered: Match[] = [];
  for (let i = 0; i < body.children.length; i++) {
    let child = body.children[i];
    if (!(child instanceof HTMLElement)) {
      continue;
    }
    if (child.children.length > 0 && isVisible(child)) {
      let childMatch = parseElement(child);
      if (childMatch instanceof Array) {
        matchsGathered.push(...childMatch);
      } else {
        levelMatch = {
          button: levelMatch.button || childMatch.button,
          fields: [...levelMatch.fields, ...childMatch.fields],
        };
      }
    }
    if (detectButton(child)) {
      levelMatch.button = child as HTMLButtonElement;
    } else if (detectField(child)) {
      levelMatch.fields.push(child as HTMLInputElement);
    }
  }
  return matchsGathered.length > 0
    ? matchsGathered
    : levelMatch.button && levelMatch.fields.length > 0
    ? [levelMatch]
    : levelMatch;
}
