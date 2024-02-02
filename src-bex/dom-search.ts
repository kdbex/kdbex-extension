import { shared } from './content-script';
import { Field, observePosition, observeSize } from './field';

/**
 * Checks if an htmlelement can be a valid input to fill data in
 * @param elt the html element
 * @returns if it is valid
 */
export function validInput(elt: HTMLElement): boolean {
	return elt instanceof HTMLInputElement && elt.tabIndex >= 0 && (elt.type == 'text' || elt.type == 'password' || elt.type == 'email') && elt.id != '' && elt.clientWidth > 0 && elt.clientHeight > 0 && !elt.hidden && elt.ariaHidden != 'true';
}

/**
 * Checks if an htmlelement can be a valid button to submit data
 * @param elt 
 * @returns 
 */
export function validButton(elt: HTMLElement): boolean {
	const L = ['suivant', 'next', 'continue', 'login', 'connexion', 'connecte', 'identifier', 'identification', 'confirm', 'submit'];
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
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return ((str.includes('onclick') && f(elt.textContent!)) || ((elt instanceof HTMLInputElement || elt instanceof HTMLButtonElement) && (elt.type == 'submit' || elt.type == 'button') && elt.tabIndex >= 0 && (f(elt.value) || f(elt.id) || (elt.textContent != null && f(elt.textContent))))) && elt.clientHeight > 0 && elt.clientWidth > 0;
}

export type Matches = [HTMLElement | null, HTMLInputElement[]];

/**
 * Will go through the body of the page and return all the matches of fields and button, recursive function
 * @param body 
 * @param list 
 * @returns 
 */
export function getMatches(body: HTMLElement, matches: Matches): Matches {	
    const children = body.querySelectorAll<HTMLElement>(':scope > *');
	if (validButton(body)) {
		
	}
    children.forEach(child => {
		if (validButton(child)) {
			console.log('I have found valid button :', child);
            matches[0] = child;
        } else if (child.children.length > 0) {
			const [u, v] = getMatches(child, matches);
			matches[1] = v;
			if(u != null)
			    matches[0] = u;
        } else if (validInput(child)) {
            matches[1].push(child as HTMLInputElement);
        }
    });
    return matches;
}


export function labelInput(elt: HTMLInputElement): boolean {
	let boolean = false;
	if (elt.type == 'password') {
		shared.fields.push(new Field(elt, true));
		boolean = true;
	} else if(elt.form){
		boolean = true;
		shared.fields.push(new Field(elt, false));
	}else{
		const values: string[] = ['mail', 'username', 'utilisateur', 'user', 'pw'];
		const id = elt.id.toLowerCase(),
			holder = elt.placeholder.toLowerCase(),
			name = elt.name;
		for (const value of values) {
			if (id.includes(value) || holder.includes(value) || name.includes(value)) {
				shared.fields.push(new Field(elt, false));
				boolean = true;
				break;
			}
		}
	}
	if(boolean){
		//TODO: fix this
		observePosition(elt, () => setTimeout(() => shared.refreshFields(), 200));
		observeSize(elt, () => setTimeout(() => shared.refreshFields(), 200));
	}
	return boolean;
}

export function observe(objects:MutationRecord[]){
	objects
	/*objects.forEach((record) => {
		record.addedNodes.forEach((node)=> {
			const e = <HTMLElement> node;
			let matches: Matches;
			let arr:HTMLElement[] = [];
			if(e instanceof HTMLDivElement){
				arr = getMatches(e, []);
				const btn = getButton(e);
				if(btn != null){
					arr.push(btn);
				}
			}else{
				arr.push(e);
			}
			for(const elt of arr){
				if(validInput(elt) && labelInput(<HTMLInputElement>elt))
					message(Script.CONTENT, Script.BACKGROUND, MessageCode.PAGE_UPDATED, buildBody());
				else if(button == null){
					const possbtn = getButton(elt);
					if(validButton(elt))
						button = elt;
					if(possbtn != null)
						button = possbtn;
					if(button != null){
						console.log('Button found and labeled :', button);
						message(Script.CONTENT, Script.BACKGROUND, MessageCode.PAGE_UPDATED, buildBody());
					}
				}
			}
		});
	})*/
}