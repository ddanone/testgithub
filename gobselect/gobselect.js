/**
 * https://lenguajejs.com/javascript/modulos/que-es-esm/
 * https://stackoverflow.com/questions/48211891/import-functions-from-another-js-file-javascript
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
 * 
 * https://lenguajejs.com/automatizadores/introduccion/commonjs-vs-es-modules/
 * 
 */
/*
export let number = 42;                  // Se añade la variable number al módulo
export const hello = () => "Hello!";     // Se añade la función hello al módulo
export class CodeBlock { };              // Se añade la clase vacía CodeBlock al módulo

let xxx = 42;
const hello = () => "Hello!";
const goodbye = () => "¡Adiós!";
class CodeBlock { };

export {
  xxx,
  hello,
  goodbye as bye,
  hello as greet
};

*/


class GobSelect{
    input   = null;     // elemento input
    ops     = {};       // opciones de configuración
    opened  = false;    // si el select está abierto
    selected = null;    // el data[ix] seleccionado
    _data   = {};
    _value  = null;
    _label  = null;
    div     = null;     // div contenedor del elemento ul
    ul      = null;     // elemento UL dentro del div
    searchButton = null;    // elemento html que activa el select
    

    constructor(input, ops){
        this.input = input;
        this.jinput= $(input);
        this.input.setAttribute("autocomplete", "off");
        this.input.setAttribute("aria-expanded", "false");
        this.input.setAttribute("aria-owns", "awesomplete_list_" + this.count);
        this.input.setAttribute("role", "combobox");

        this.options = ops = ops || {};
        this._configure(this, {
            data: [],         //_.DATA,
            minChars: 2,
            maxItems: 4,
            autoFirst: false,
            tabSelect: true,
            searchButton: null,

            
            filter: null,       //_.FILTER_CONTAINS,
            sort: null,         //o.sort === false ? false : _.SORT_BYLENGTH,
            container: null,    //_.CONTAINER,
            item: null,         //_.ITEM,
            replace: null,      //_.REPLACE,
            
            listLabel: "Results List"
        }, ops);
        if(this.container==null) this.container=input;
        if(this.searchButton!=null){
            let me=this;
            this.searchButton.addEventListener('click',function(){
                if(!me.opened){
                    me.open();
                    me.input.focus();
                }else{
                    me.close();
                }
            });
        }
        this.createFromData();
        this.position();
        this._bindEvents();
        this.input.focus();
    }
    _configure(instance, properties, o) {
        for (var i in properties) {
            var initial = properties[i],
                attrValue = instance.input.getAttribute("data-" + i.toLowerCase());
            if (typeof initial === "number") {
                instance[i] = parseInt(attrValue);
            }else if (initial === false) { // Boolean options must be false by default anyway
                instance[i] = attrValue !== null;
            }else if (initial instanceof Function) {
                instance[i] = null;
            }else if (initial instanceof Array) {
                instance[i] = o[i];
            }else {
                instance[i] = attrValue;
            }
            if (!instance[i] && instance[i] !== 0) {
                instance[i] = (i in o)? o[i] : initial;
            }
        }
    }
    /**
     * select by LI element
     * @param  {[type]} li [description]
     * @return void
     */
    _select(li){    // select by LI element
        if(li.length==0){
            this.close();
            return;
        }
        let ix=parseInt(li.attr('ix'));
        this.selected   = this._data[ix];
        this._value     = this.selected.v;
        this._label     = this.selected.l;
        this.input.value= this._label;

        this.close();
    }

    _scroll(){
        let cur = this.ul.find('[aria-selected=true]')[0];
        if(cur!=undefined)
            this.ul[0].scrollTop = cur.offsetTop - this.ul[0].clientHeight + cur.clientHeight;
    }

    /**
     * Create list from this._data, append to container and bind mouse events 
     * @return void
     */
    createFromData(){
        let s='';
        this.div = $(`<div for="${this.input.id}" class="gobselect" hidden></div>`);
        this.div.insertAfter(this.container);
        s='';
        for(var x in this._data){
            s+=`<li v="${this._data[x].v}" ix="${x}">${this._data[x].l}</li>`;
        }
        this.ul = $(`<ul>${s}</ul>`);
        this.ul.appendTo(this.div);
        this._bindMouseEvents();
    }


    /**
     * Adjust list to input width and left
     * @return void
     */
    position(){
        let p=this.jinput.position();
        this.div.css('left',p.left );
        this.div.css('top', p.top+this.jinput.height()+5 );
        this.div.width(this.jinput.outerWidth());
        // limitar altura en función de  this.maxItems
        
        //setTimeout(this.makeHeigth(this),200);

        //this.makeHeigth(this)
        let h =0;
        for(var x=0; x<this.maxItems ; x++){
            let m= this.ul.children().eq(x).outerHeight()||0;
            h+= m;
        }
        this.ul.css('height',h+10 );


    }
    makeHeigth(o){
        console.log('max items '+o.maxItems);
        let h =0;
        for(var x=0; x<o.maxItems ; x++){
            let li = o.ul.children()[x];
            let m=$(li).outerHeight()||0;
            console.log('x: '+x+'__'+m);
            h+= m;

        }
        console.log('max h: '+h);
        this.ul.css('height',h+10 );
    }

    /**
     * setter for this._data
     * @param  {[type]} data [description]
     * @return void
     */
    set data(data){
        if (Array.isArray(data)) {
            this._data = data;
        }else if (typeof data === "string" && data.indexOf(",") > -1) {
            this._data = data.split(/\s*,\s*/);
        }
    }
    /**
     * getter for this._data
     * @return object
     */
    get data(){
        return this._data;
    }

    /**
     * open select
     * @return void
     */
    open(){
        this.input.setAttribute('aria-expanded',true);
        this.opened=true;
        this.div.removeAttr('hidden');
        this.position();
        this._scroll();
    }  
    /**
     * close select
     * @return void
     */
    close(){
        this.input.setAttribute('aria-expanded',false);
        this.opened=false;
        this.div.attr('hidden','true');
    }
    /**
     * select the next LI element
     * @return void
     */
    next(){
        let me=this;
        let old = this.ul.find('[aria-selected=true]');
        old.removeAttr('aria-selected');
        if( old.length==0 ){
            me.ul.children().first().attr('aria-selected','true');
        }else if( old.is( me.ul.children().last() ) ){
            me.ul.children().first().attr('aria-selected','true');
        }else{
            old.next().attr('aria-selected','true');
        }
        this._scroll();
    }
    /**
     * select the previous LI element
     * @return {[type]} [description]
     */
    previous(){
        let me=this;
        let old = this.ul.find('[aria-selected=true]');
        old.removeAttr('aria-selected');
        if( old.length==0 ){
            me.ul.children().last().attr('aria-selected','true');
        }else if( old.is( me.ul.children().first() ) ){
            me.ul.children().last().attr('aria-selected','true');
        }else{
            old.prev().attr('aria-selected','true');
        }
        this._scroll();
    }
    /**
     * clear selection
     * @return void
     */
    clear(){
        this.selected   = null;
        this._value     = null;
        this._label     = null;
        this.input.value= null;
        this.ul.find('[aria-selected=true]').removeAttr('aria-selected');
    }
    /**
     * get the label of selected item
     * @return string
     */
    get label(){
        return this._label;
    }
    /**
     * select option from a given label 
     * @param  string
     * @return void
     */
    set label(v){
        if(v==''||v==null||v==undefined){
            this.clear();
        }
        let data=this._data;
        var ix=this._data.findIndex( data=>data.l==v );
        if(ix==-1) return false;
        this.ul.find('[aria-selected=true]').removeAttr('aria-selected');
        this.ul.find(`[ix=${ix}]`).attr('aria-selected','true');
        this._select( this.ul.find('[aria-selected=true]') );
    }
    /**
     * get the value of the selected item
     * @return {[type]} [description]
     */
    get value(){
        return this._value;
    }
    /**
     * set item by value 
     * @param  string
     */
    set value(v){
        if(v==''||v==null||v==undefined){
            this.clear();
        }
        let data=this._data;
        var ix=this._data.findIndex( data=>data.v==v );
        if(ix==-1) return false;
        this.ul.find('[aria-selected=true]').removeAttr('aria-selected');
        this.ul.find(`[ix=${ix}]`).attr('aria-selected','true');
        this._select( this.ul.find('[aria-selected=true]') );
        return this._data[ix];
    }

    /**
     * create mouse events for UL element
     * @return {[type]} [description]
     */
    _bindMouseEvents(){
        let me=this;
        this.ul[0].addEventListener('mousedown',function(evt){
            evt.preventDefault();
        });
        this.ul[0].addEventListener('click',function(evt){
            var li = evt.target;
            me.value=li.getAttribute('v');
        });
    }
    /**
     * bind keyboard events
     * @return {[type]} [description]
     */
    _bindEvents(){
        let me=this;
        this.input.addEventListener('blur',function(evt){
            if(me.opened) me.close();
        });
        this.input.addEventListener('paste',function(evt){
            evt.preventDefault();
        });
        this.input.addEventListener('keydown',function(evt){
            var c = evt.keyCode;
            if (c === 38 || c === 40) { // Down/Up arrow
                evt.preventDefault();
                if(!me.opened){
                    me.open();
                    if(me.selected==null)
                        me[c === 38? "previous" : "next"]();            
                    return;
                }else if( me.selected==null ){
                    me[c === 38? "previous" : "next"]();            
                }else{
                    me[c === 38? "previous" : "next"]();            
                }
            }
            if (c === 13 && me.ul.find('[aria-selected=true]')) { // Enter
                evt.preventDefault();
                if(!me.opened)return;
                me._select(me.ul.find('[aria-selected=true]'));
            }else if (c === 9 && me.tabSelect) {     // tab
                if(!me.opened) return;
                me._select(me.ul.find('[aria-selected=true]'));
            }else if (c === 27 ) {     // esc
                if(me.selected!=null){
                   me.value=me._value;
                }
                me.close();
            }
            evt.preventDefault();
        });
    }
    /**
     * add a new option
     * @param array|object|undefined item  -> undefined para añadir un elemento en blanco al principio
     * @param number where -> 0 añadirlo al principio; 1 añadirlo al final
     */
    addOption(item,where){
        where=where||'';
        if( item instanceof Array ){
            for(var x in item){
                if(where==0){
                    this._data.push(item[x]);
                }else{
                    this._data.unshift(item[x]);
                }
            }
        }else if(item==undefined){
            this._data.unshift({v:'',l:'&nbsp;'});
        }else{
            if(where==0){
                this._data.push(item);
            }else{
                this._data.unshift(item);            
            }
        }
        this.removeDiv();
        this.createFromData();
    }
    /**
     * eliminar una opción por valor
     * @param  {[type]} val [description]
     * @return {[type]}     [description]
     */
    delOption(val){
        var ix=this._data.findIndex( data=>data.v==val );
        this._data.splice(ix,1);
        this.removeDiv();
        this.createFromData();
    }
    /**
     * remove the div containig the select
     * @return {[type]} [description]
     */
    removeDiv(){
        $(this.div).remove();
    }
    /**
     * sort this._data by the given index
     * @param  string fieldToSort -> field to sort (default: v)
     * @return void
     */
    sortData(fieldToSort){
        fieldToSort = fieldToSort||'l';
        this._data.sort((a, b) => {
            const labelA = a[fieldToSort];
            const labelB = b[fieldToSort];
            if (labelA<labelB)return -1;
            if (labelA > labelB)return 1;
            return 0;
        });
    }

}

export { GobSelect }

