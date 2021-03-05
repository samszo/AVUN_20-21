class adln {
    constructor(params) {
        var me = this;
        this.cont = params.cont ? params.cont : d3.select('body');
        this.apiUrls = params.apiUrls ? params.apiUrls : false;
        this.apiUrl = params.apiUrl ? params.apiUrl : false;
        this.waitUrl = params.waitUrl ? params.waitUrl : false;
        this.data = params.data ? params.data : {}; 
        this.idVocab = 0;
        var vocab, tables, classes, properties, items=[], omekaQuery=[],divWait
        , propsForOmekaType = {
            'o:ResourceClass':['@id','o:id','o:label','o:term']
            ,'o:Property':['@id','o:id','o:label','o:term']
            ,'o:Item':['@id','o:id','o:title','o:resource_class','properties']
        };

        function verifInit(){
            if(!me.apiUrl){
                throw "L'url de l'API n'est pas valide. Merci de le définir";
                return;
            }            
            if(me.apiUrl.substr(me.apiUrl.length-1,1)!='/')me.apiUrl+='/';
        }

        this.getListeVocabulaire = function(idCont, fctEnd){
            verifInit();    
            d3.json(me.apiUrl+"vocabularies").then(function(vocabs) {
                let contSlct = d3.select("#"+idCont);
                contSlct.select('#slctVocabs').remove();
                contSlct.select('#slctVocabsLbl').remove();
                contSlct.append('label').attr('id','slctVocabsLbl').attr('for','slctVocabs').html('Choisir un vocabulaire :');
                let slct = contSlct.append('select')
                    .attr('id','slctVocabs')
                    .attr('name','vocabs')                    
                    .on('change',function(d){
                        let id = this.options[this.selectedIndex].id;
                        if(fctEnd)fctEnd(id);
                    });
                slct.selectAll('option').data(vocabs).enter().append('option')
                    .attr('id',d=>{
                        return d['o:id'];
                    })
                    .html(d=>d['o:label']);
            });
        }

        this.getListeApi = function(idCont, fctEnd){
            let contSlct = d3.select("#"+idCont);
            contSlct.append('label').attr('for','slctApi').html('Choisir une api :');
            let slct = contSlct.append('select')
                .attr('id','slctApi')
                .attr('name','apis')                    
                .on('change',function(d){
                    let url = this.options[this.selectedIndex].id;
                    me.apiUrl = url;
                    me.cont.select('h1').remove();
                    me.cont.selectAll('table').remove();        
                    if(fctEnd)fctEnd(idCont,me.showData);
                });
            slct.selectAll('option').data(me.apiUrls).enter().append('option')
                .attr('id',d=>{
                    return d.url;
                })
                .html(d=>d.titre);
        }

        

          
        this.getItems = function (idVocab) {
            me.init(idVocab);
            let rs = [];
            items.forEach(i=>{
                rs.push(getTypeVals(i));
            })
            //met à plat les valeurs
            rs = rs.map(d=>{
                let r=[];
                d.forEach(p=>{
                    if(p.p)r[p.p]=p.v;
                    else r[p.k]=p.v
                });
                return r;
            });
            //regroupe les valeurs par class 
            rs = d3.nest()
                .key(d=> d['o:resource_class'])
                .entries(rs); 
            return rs;
        }

        this.init = function (idVocab) {
            me.showWait();



            verifInit();            
            
            me.idVocab = idVocab;
            if(!me.idVocab){
                throw "L'identifiant du vocabulaire n'est pas bon. Merci de le définir";
                return;
            }
            
            //charges les vocabulaires de la fiction en synchrone
            tables = [];
            vocab = getJsonSynchrone(me.apiUrl+"vocabularies/"+me.idVocab);
            classes = getJsonSynchrone(me.apiUrl+"resource_classes?vocabulary_id="+me.idVocab);
            properties = getJsonSynchrone(me.apiUrl+"properties?vocabulary_id="+me.idVocab);

            //récupère les items
            items = [];
            classes.forEach(d => {
                items = items.concat(getJsonSynchrone(me.apiUrl+"items?resource_class_id="+d['o:id']));
            })
           me.hideWait();               
        }

        this.showData = function (idVocab) {
            me.init(idVocab);
            createTableData();
        }

        function createTableData(){
            //suprime les conteneurs obsolètes
            me.cont.select('h1').remove();
            me.cont.selectAll('table').remove();

            //cration des tables
            me.cont.append('h1').html(vocab['o:label']);
            let htmlTable = me.cont.selectAll('table').data([
                {'nom':'Tables','rs':classes}
                ,{'nom':'Propriétés','rs':properties}
                ,{'nom':'Items','rs':items}
            ]).enter()
                .append('table')
                .attr('id',(d,i)=>'adlnTable'+i)
                .style('height',"100%")
                .style('width',"100%");
            htmlTable.append('thead').append('tr').append('th')
                .attr('colspan',d=>{
                    let type = Array.isArray(d['rs'][0]['@type']) ? d['rs'][0]['@type'][0] : d['rs'][0]['@type'];
                    return propsForOmekaType[type].length;
                })
                .html(d=>'<h2>'+d.nom+'</h2>');
            let htmlTableBody = htmlTable.append('tbody');
            let tr = htmlTableBody.selectAll('tr').data(d=>{
                //récupère les colonnes
                var cols = d3.nest()
                    .key(d=> d.k)
                    .entries(getTypeVals(d.rs[0])).map(d=>{return {k:'titre',v:d.key};});                            
                //ajoute une ligne pour l'entête
                d.rs = [{'titres':cols}].concat(d.rs);
                return d.rs;
            }).enter().append('tr');
            tr.selectAll('td').data((d,i)=>{
                let rs = d.titres ? d.titres : getTypeVals(d);
                return rs;
            }).enter().append('td').html(d=>{
                var html = '';
                switch (d.k) {
                    case '@id':
                        html=geyOmkUrls(d);   
                        break;                
                    case 'titre':
                        html='<h3>'+d.v+'</h3>';   
                        break;                
                    default:
                        html = d.v
                        break;
                }
                return html;
            })
        }

        function geyOmkUrls(d){
            let urlAdmin = "";
            switch (d.t) {
                case 'o:ResourceClass':
                    urlAdmin = d.v.substr(0,d.v.indexOf('api'))+'admin/vocabulary/15/classes';
                    break;
                case 'o:Property':
                    urlAdmin = d.v.substr(0,d.v.indexOf('api'))+'admin/vocabulary/15/properties';
                    break;
                default:
                    urlAdmin = d.v.replace('api/items', 'admin/item');
                    break;
            }
            return '<a href="'+d.v+'" target="_blank">json</a>'
                +' -> '
                +'<a href="'+urlAdmin+'" target="_blank">admin</a>';   

        }

        function getTypeVals(d) {
            let vals = [];
            if(Array.isArray(d['@type'])){
                d['@type'].forEach(t=>{
                    vals = vals.concat(getTypePropertiesVals(d, t));
                })
            }else{
                vals = vals.concat(getTypePropertiesVals(d, d['@type']));
            };                

            return vals; 
        }

        function getTypePropertiesVals(d, t) {
            let vs = [], vals=[];
            if(propsForOmekaType[t]){
                propsForOmekaType[t].forEach(p=>{
                    if(p=='properties'){
                        //récupère toutes les propriétés du vocabulaire
                        properties.forEach(prop=>{
                            vs = vs.concat(getVals(d, t, prop['o:term']));
                        })
                        
                    }else    
                        vs = vs.concat(getVals(d, t, p));
                })            
                vals = vals.concat(vs);            
            }
            return vals;
        }

        function getVals(d, t, p) {
            let vs=[];
            if(Array.isArray(d[p])){
                d[p].forEach(v=>{
                    vs.push(getVal(d, t, p, v));
                })
            }else
                vs.push(getVal(d, t, p, d[p]));
            return vs;
        }

        function getVal(d, t, p, v) {
            let vs;
            if(!v)return {t:t,k:p,v:'-'};
            if(v['@id']){
                let o = getJsonSynchrone(v['@id']);
                let lbl = o['o:label'] ? o['o:label'] : o['o:title'];
                lbl += ' ('+o['o:id']+')';
                vs = {t:t,k:p,v:lbl};
            }else if(v['@value']){
                vs = {t:t,k:p,v:v['@value'],p:v['property_label']};
            }else   
                vs = {t:t,k:p,v:v};
            return vs;
        }

        function fctExecute(p) {
            switch (p.data.fct) {
                case 'showData':
                  break;
                default:
                  console.log(p);
            }            
        }   

        function chargeSVG(url, idCont){
            d3.xml(url)
                .then(data => {
                    d3.select("#"+idCont).node().append(data.documentElement);
                    let cont = d3.select("#"+idCont).node();
                    let svg = d3.select("#"+idCont+" svg");
                    let bb = svg.node().getBBox();
                    svg.attr('height',cont.offsetHeight)
                        .attr('width',cont.offsetWidth)        
                        //.attr('viewBox','0 0 '+bb.width+' '+bb.height)
                        .attr('preserveAspectRatio','xMinYMin meet');
            });
        }

        this.showWait = function (){
            divWait.style('display','block');
        }
        this.hideWait = function (){
            divWait.style('display','none');
        }

        function getJsonSynchrone(url){
            let json;
            if(omekaQuery[url])return omekaQuery[url];
            var request = new XMLHttpRequest();
            request.open('GET', url, false);  // `false` makes the request synchronous
            request.send(null);                    
            if (request.status === 200) {
                omekaQuery[url]=JSON.parse(request.responseText);
                return omekaQuery[url];
            }else{
                throw "Erreur dans la récupération des données : "+url;
            }                    
        }

        //création du svg d'attente
        divWait = this.cont.append("div").attr('id','adln-svg-wait').style('display','none');
        if(this.waitUrl){
            chargeSVG(this.waitUrl,'adln-svg-wait');    
        }
    }
}

  




