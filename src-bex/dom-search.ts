import { shared } from './content-script';
import { Field, observePosition, observeSize } from './field';

/**
 * Checks if an htmlelement can be a valid input to fill data in
 * @param elt the html element
 * @returns if it is valid
 */
export function validInput(elt: HTMLElement): boolean {
  return (
    elt instanceof HTMLInputElement &&
    elt.tabIndex >= 0 &&
    (elt.type == 'text' || elt.type == 'password' || elt.type == 'email') &&
    elt.id != '' &&
    elt.clientWidth > 0 &&
    elt.clientHeight > 0 &&
    !elt.hidden &&
    elt.ariaHidden != 'true'
  );
}

/**
 * Checks if an htmlelement can be a valid button to submit data
 * @param elt
 * @returns
 */
export function validButton(elt: HTMLElement): boolean {
  const L = [
    'suivant',
    'next',
    'continue',
    'login',
    'connexion',
    'connecte',
    'identifier',
    'identification',
    'confirm',
    'submit',
  ];
  function f(s: string): boolean {
    for (const e of L) {
      if (s.toLowerCase().includes(e)) {
        return true;
      }
    }
    return false;
  }
  let str = new XMLSerializer().serializeToString(elt);
  str = str.substring(0, str.indexOf('>'));
  return (
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ((str.includes('onclick') && f(elt.textContent!)) ||
      ((elt instanceof HTMLInputElement || elt instanceof HTMLButtonElement) &&
        (elt.type == 'submit' || elt.type == 'button') &&
        elt.tabIndex >= 0 &&
        (f(elt.value) ||
          f(elt.id) ||
          (elt.textContent != null && f(elt.textContent))))) &&
    elt.clientHeight > 0 &&
    elt.clientWidth > 0
  );
}

export type Matches = [HTMLElement | null, HTMLInputElement[]];

function elementSearch(matches: Matches, child: HTMLElement) {
  if (validButton(child)) {
    matches[0] = child;
  } else if (validInput(child)) {
    matches[1].push(child as HTMLInputElement);
  } else if (child.childElementCount > 0) {
    const [u, v] = getMatches(child, matches);
    matches[1] = v;
    if (u != null) matches[0] = u;
  }
}

/**
 * Will go through the body of the page and return all the matches of fields and button, recursive function
 * @param body
 * @param list
 * @returns
 */
export function getMatches(body: HTMLElement, matches: Matches): Matches {
  const children = body.querySelectorAll<HTMLElement>(':scope > *');
  children.forEach((child) => {
    elementSearch(matches, child);
  });
  return matches;
}

export function labelInput(elt: HTMLInputElement): boolean {
  let boolean = false;
  if (shared.fields.find((field) => field.input.id === elt.id)) {
    return false;
  }
  if (elt.type == 'password' || elt.type == 'email') {
    shared.fields.push(new Field(elt, elt.type == 'password'));
    boolean = true;
  } else {
    const values: string[] = [
      'mail',
      'username',
      'utilisateur',
      'user',
      'pw',
      'login',
    ];
    const id = elt.id.toLowerCase(),
      holder = elt.placeholder.toLowerCase(),
      name = elt.name;
    for (const value of values) {
      if (
        id.includes(value) ||
        holder.includes(value) ||
        name.includes(value)
      ) {
        shared.fields.push(new Field(elt, false));
        boolean = true;
        break;
      }
    }
  }
  if (!boolean && elt.form && shared.button) {
    const form = elt.form;
    let btn: HTMLElement | null = shared.button;
    while (btn != null) {
      btn = btn.parentElement;
      if (btn instanceof HTMLFormElement) {
        break;
      }
    }
    if (btn && btn == form) {
      shared.fields.push(new Field(elt, false));
      boolean = true;
    }
  }
  if (boolean) {
    observePosition(elt, () => setTimeout(() => shared.refreshFields(), 200));
    observeSize(elt, () => setTimeout(() => shared.refreshFields(), 200));
  } else {
    console.debug('Did not label input', elt);
  }
  return boolean;
}

export function observe(objects: MutationRecord[]) {
  objects.forEach((record) => {
    let update = false;
    record.addedNodes.forEach((node) => {
      const e = <HTMLElement>node;
      const matches: Matches = [null, []];
      elementSearch(matches, e);
      if (shared.button == null && matches[0] != null) {
        shared.button = matches[0];
        update = true;
      }
      if (matches[1].length > 0) {
        matches[1].forEach((match) => {
          if (labelInput(match)) {
            update = true;
          }
        });
      }
    });
    if (update) {
      shared.sendTabInfo(false);
    }
  });
}
