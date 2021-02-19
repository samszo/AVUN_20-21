class opml{
    constructor(params) {
        var me = this;
        this.data = [];
        this.dashboard = [];
        this.flux = [];
        this.rss = [];
        this.urlData = params.urlData ? params.urlData : false;
        this.idCont = params.idCont ? params.idCont : false;

        this.init = function () {

            d3.xml(me.urlData, function(error, data) {
                //récupère le conteneur et sa taille
                let cont = d3.select('#'+me.idCont);
                let h = cont.node().offsetHeight-100;                

                //initalisation de la visualisation
                d3.select('#nb-opml').remove();
                d3.select('#content-opml').remove();
                
                if (error){
                    cont.html('Aucun flux trouvé !');
                    return;
                }
                me.data = data;

                //récupère la définition du dashboard
                me.dashboard = [].map.call(data.querySelectorAll("head"), function(head) {
                    return {
                    title: head.querySelector("title").textContent,
                    data: head.querySelector("creationDate").textContent
                    };
                });
                //récupère les flux
                let arrGroup = [], nbGroup=1, arrFlux = [], arrRss = [];
                data.querySelectorAll("outline").forEach(function(outline) {
                    if(outline.getAttribute("icon")=="rss" || outline.getAttribute("icon")=="home"){
                        outline.querySelectorAll("outline").forEach(function(rss, i) {
                            //console.log(rss);
                            if(!arrGroup[outline.getAttribute("title")]){
                                arrGroup[outline.getAttribute("title")]=nbGroup;
                                me.flux.push({title: outline.getAttribute("title"),'rss':[]});
                                nbGroup++;
                            }
                            let idGroup = arrGroup[outline.getAttribute("title")]-1; 
                            if(!arrFlux[rss.getAttribute("title")] && rss.getAttribute("xmlUrl")){
                                let oRss = {
                                    'idRss':'rssG'+idGroup+'F'+i,
                                    'title': rss.getAttribute("title"),
                                    'xmlUrl': rss.getAttribute("xmlUrl"),
                                }                                
                                me.flux[idGroup].rss.push(oRss);
                                arrFlux[rss.getAttribute("title")]=1;
                                arrRss.push(oRss);
                            }else{
                                arrFlux[rss.getAttribute("title")]+=1;
                            }
                        });
                    }
                });
                //valide les flux
                me.flux = me.flux.filter(function(f){
                    return f.rss.length;
                })
                //console.log(me.flux);

                /*récupère le contenu du flux
                me.flux.forEach(function(f){

                });
                */

                //construction de la visualisation
                let nbOpml = cont.append('nav')
                    .attr('id','nb-opml')
                    .attr('class','navbar navbar-light bg-light')
                    .append('a')
                    .attr('class','navbar-brand')
                    .attr('href','#')
                    .html('Flux RSS')
                    .append('ul')
                    .attr('class','nav nav-pills')
                    ;
                let groupe = nbOpml.selectAll('li').data(me.flux).enter().append('li')
                    .attr('class','nav-item dropdown')
                    .append('a')
                    .attr('class','nav-link dropdown-toggle')
                    .attr('data-toggle','dropdown')
                    .attr('href','#')
                    .attr('role','button')
                    .attr('aria-haspopup','true')
                    .attr('aria-expanded','false')
                    .html(function(d){
                        return d.title;
                        })
                    .append('div')
                    .attr('class','dropdown-menu');

                let rss = groupe.selectAll('a').data(function(d){
                        return d.rss
                    }).enter()
                    .append('a')
                    .attr('class','dropdown-item')
                    //.style('z-index',1000)
                    .attr('href',function(r, i){
                        return '#'+r.idRss;
                        })
                    .on("click",function(d){
                            console.log(d);
                            location.href = "#"+d.idRss;
                        })
                    .html(function(r){
                        return r.title;
                        });
                    
                let nbContent = cont.append('div')
                        .attr('id','content-opml')
                        .attr('data-spy','scroll')
                        .attr('data-target','nb-opml')
                        .attr('data-offset','0')
                        .style('height',h+'px')
                        .style('overflow-y','scroll')                        
                        .style('position','relative')                        
                        ;
                let rssContent = nbContent.selectAll('div').data(arrRss).enter()
                        .append('div')
                        .attr('id',function(r, i){
                            return r.idRss;
                            })
                        .html(function(r){
                            let htm = "<h4>"+r.title+"</h4>";
                            //htm += '<iframe id="if'+r.idRss+'" title="'+r.title+'" src="'+r.xmlUrl+'"></iframe>';
                            return htm;
                            });
                    rssContent.append('button')
                        .attr('type',"button")
                        .attr('class',"btn btn-warning")
                        .html('Afficher le flux')
                        .on('click',function(d){
                            me.getRss(d);
                        });
                    rssContent.append('div')
                        .attr('id',function(d){
                            return 'ct'+d.idRss;
                        });


                //pour gérer les scrollspy
                $('[data-spy="scroll"]').each(function () {
                    var $spy = $(this).scrollspy('refresh')
                    })
                $('#nb-opml').scrollspy();

                /*construction de la visualisation simple
                d3.select('#'+me.idCont).html('');
                let groupe = d3.select('#'+me.idCont).selectAll('ul').data(me.flux).enter()
                    .append('ul')
                    .html(function(d){
                        return d.title;
                        });
                let rss = groupe.selectAll('li').data(function(d){
                    return d.rss
                }).enter()
                .append('li')
                .html(function(r){
                    return '<a href="'+r.xmlUrl+'" >'+r.title+'</a>';
                    });
                */    

            });

           
        };

        this.getRss = function (d) {
           let u = 'https://jardindesconnaissances.univ-paris8.fr/jdc/public/flux/ajax';
           let dt = {'u':d.xmlUrl};
           $.ajax({
                url: u,
                type: 'GET',
                data:dt,
                dataType: "xml",
                crossDomain: true,
                success: function(data) { 
                    //construction du rss à partir d'atom
                    data.querySelectorAll("feed").forEach(function(feed) {
                        me.rss = [{
                            'title':feed.querySelector("title").textContent
                            ,'updated':feed.querySelector("updated").textContent
                            ,'entries':[]
                        }];
                        feed.querySelectorAll("entry").forEach(function(entry) {
                            //sélectionne la première image
                            let e = {
                                'title':entry.querySelector("title").textContent
                                ,'updated':entry.querySelector("updated").textContent
                                ,'summary':entry.querySelector("summary").textContent
                            };
                            entry.querySelectorAll("link").forEach(function(link) {
                                if(link.getAttribute("type")=='image/jpeg')e.img = link.getAttribute("href");                            
                                if(link.getAttribute("type")=='text/html')e.link = link.getAttribute("href");                            

                            });
                            me.rss[0].entries.push(e);
                        });
                    });
                    if(!me.rss[0]){
                        //construction du rss à partir de rss
                        data.querySelectorAll("channel").forEach(function(feed) {
                            me.rss = [{
                                'title':feed.querySelector("title").textContent
                                ,'updated':feed.querySelector("lastBuildDate").textContent
                                ,'entries':[]
                            }];
                            feed.querySelectorAll("item").forEach(function(entry) {
                                //sélectionne la première image
                                let e = {
                                    'title':entry.querySelector("title").textContent
                                    ,'updated':entry.querySelector("pubDate").textContent
                                    ,'summary':entry.querySelector("description").textContent
                                    ,'link':entry.querySelector("link").textContent
                                };
                                entry.querySelectorAll("category").forEach(function(cat) {
                                    if(!e.category)e.category = [];
                                    e.category.push(cat.textContent);                                
                                });
                                me.rss[0].entries.push(e);
                            });
                        });
                    }
                    //affichage du flux
                    if(me.rss[0].entries.length){
                        let liRss = d3.select('#ct'+d.idRss).append('ul').attr('class','list-unstyled').selectAll('li').data(me.rss[0].entries).enter()
                        .append('li').attr("class",'media'); 
                        liRss.append('img')
                            .style("height",'128px')
                            .attr("class",'mr-3 img-thumbnail')
                            .attr("src",function(d){return d.img});
                        let divBody = liRss.append('div').attr("class",'media-body');
                        divBody.append('h5').attr("class",'mt-0 mb-1').html(function(d){
                            return d.title
                        });
                        //divBody.append('a').attr("href",function(d){return d.link}).html('détails');
                        divBody.append('p').html(function(d){
                            return d.summary+'   <a href="'+d.link+'" >en savoir plus</a>';
                        });
                    }

                },
                error: function(error) { 
                    console.log(error); 
                },
            });            
        }

        this.init();
    }
}


  
