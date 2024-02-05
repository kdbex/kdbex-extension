
/**
 * File that manages all the fields that are detected on the map, and the actions that are linked to them
 */
import { TabState, shared } from './content-script';
import { post } from './http';


function px(i: number) {
	return i + 'px';
}

export class Field{
	input: HTMLInputElement;//The input field
	kdbxContainer: HTMLDivElement;//Main container of the addon
	image !: HTMLImageElement;
	action !: HTMLDivElement;
	opened: boolean;//If action is opened or not
	pw: boolean;//If this will store password or username / mail
	animate: boolean | null;

	constructor(input: HTMLInputElement, pw: boolean){
		this.input = input;
		this.pw = pw;
		this.opened = false;
		this.animate = null;
		this.kdbxContainer = document.createElement('div');
		this.kdbxContainer.classList.add('kdbx-container');
		document.body.appendChild(this.kdbxContainer);
		this.refreshField();
	}

	createImage(){
		this.image = document.createElement('img');
		this.image.classList.add('kdbx-image');
		//On define la source en fonction du state
		this.image.src = chrome.runtime.getURL('assets/icon.png');
		//on define le onclick
		this.image.onclick = () => {
			if(this.opened){
				this.closeField();
			}else{
				shared.closeFields();
				this.opened = true;
                shared.refreshFields();
			}
		}
	}

	closeField(){
		this.opened = false;
		this.refreshField();
	}

	createAction(){
		this.action = document.createElement('div');
		if(!this.opened){
			return;
		}
		this.action.classList.add('kdbx-action');//Set the attribute
		this.action.style.paddingLeft = px(this.image.getBoundingClientRect().height / 2 + 1);
		this.action.style.left = px(this.image.getBoundingClientRect().height / 2);
		this.action.style.background = 'white';
		switch (shared.status) {
			case TabState.NOLOG:
				this.action.innerHTML = 'No entries found for this url.';
				break;
			case TabState.DATA:
				const select = document.createElement('select');
				select.classList.add('kdbx-select');
				for (const elt of shared.entries) {
					const opt = document.createElement('option');
					opt.text = elt.name;
					opt.value = elt.id;
					select.appendChild(opt);
				}
				select.childNodes.forEach((c) => {
					const opt: HTMLOptionElement = <HTMLOptionElement>c;
					if (opt.value == shared.selectedEntry?.id) {
						opt.selected = true;
					}
				});
				select.addEventListener('change', () => {
					const value = select.value;
					const ne = shared.entries.filter((e) => e.id == value)[0];
					shared.fillEntry(ne);
					shared.selectedEntry = ne;
					shared.bridge.send('EntrySelected', ne.id);
				});
				this.action.appendChild(select);
				break;
			default:
				const pwinput = document.createElement('input');
				pwinput.classList.add('kdbx-input');
				pwinput.style.all = 'initial';
				pwinput.style.height = '80%';
				pwinput.style.setProperty('border', 'none', 'important');
				pwinput.style.setProperty('padding', '0px', 'important');
				pwinput.type = 'password';
				pwinput.placeholder = 'Kdbx password';
				pwinput.onkeydown = (ev) => {
					if (ev.key == 'Enter') {
						post('/login', { keyTH: pwinput.value}, false).then(token => {
							shared.bridge.send('Connect', token);
						  }).catch(() => {
							//Do smth
						  });
					}
				};
				this.action.appendChild(pwinput);
				break;
		}
		//We animate it for later
		this.animate = true;
	}

	public refreshField(){
		if(!shared.button){
			this.kdbxContainer.innerHTML = '';
			return;
		}
		this.createAction();
		this.createImage();
		this.updateField();
		if(this.animate != null){
			this.animateAction(this.animate);
			this.animate = null;
		}
	}

	public updateField(){
		//We replace the children with the new ones
		this.kdbxContainer.replaceChildren(this.image, this.action);
		//We update the position and the width
		const bounding = this.input.getBoundingClientRect();
		const ratio = 0.75;
		const W = bounding.height;
		this.kdbxContainer.style.left = px(bounding.left + bounding.width - (W * (1 + ratio)) / 2 + window.scrollX);
		this.kdbxContainer.style.top = px(bounding.top + (W * (1 - ratio)) / 2 + window.scrollY);
		this.kdbxContainer.style.height = px(W * ratio);
	}

	animateAction(open: boolean, end: (() => void) | undefined = undefined){
		if (end) 
			this.action.onanimationend = end;
		const width = Math.round(this.action.getBoundingClientRect().width);
		const arr = [];
		for(let i = 1; i <= width; i++){
			arr.push(px(i));
		} 
		if(!open)
			arr.reverse();
		this.action.animate({
			width: arr
		}, 250);
		this.action.children.item(0)?.animate({
			width: arr
		}, 250);
	}
}

/**
 * 
 * @param element 
 * @param callback 
 * @returns 
 */
export function observeSize(element: HTMLElement, callback: () => void): () => void {
    const resizeObserver = new ResizeObserver(() => {
        callback();
    });
    resizeObserver.observe(element);
    return () => {
        resizeObserver.disconnect();
    };
}

export function observePosition(element: HTMLElement, callback: () => void): () => void {
    const positionObserver = document.createElement('div');
    Object.assign(positionObserver.style, {
        position: 'fixed',
        pointerEvents: 'none',
        width: '2px',
        height: '2px'
    });
    element.appendChild(positionObserver);

    const reposition = () => {
        const rect = positionObserver.getBoundingClientRect();
        Object.assign(positionObserver.style, {
            marginLeft: `${parseFloat(positionObserver.style.marginLeft || '0') - rect.left - 1}px`,
            marginTop: `${parseFloat(positionObserver.style.marginTop || '0') - rect.top - 1}px`
        });
    };
    reposition();

    const intersectionObserver = new IntersectionObserver((entries) => {
        const visiblePixels = Math.round(entries[0].intersectionRatio * 4);
        if (visiblePixels !== 1) {
            reposition();
            callback();
        }
    }, {
        threshold: [0.125, 0.375, 0.625, 0.875]
    });
    intersectionObserver.observe(positionObserver);

    return () => {
        intersectionObserver.disconnect();
        positionObserver.remove();
    };
}
