1. Détacter automatiquement les Concepts et leurs attribuer une dimension: 

- Faire une lécture du fichier XML
- Détécter toutes les ellipses (svg:ellipse) 
- Trier les elipses de la plus grande a la plus petite en fonction du rx et ry 
- Attribution du P_0 a l'ellipse avec un rx et ry max 
- Attribuer P_0_1 a l'ellipse avec un rx1<rx.max et ry1< ry.max
- Incrémenter P_0_1 (P_0_1+1) si rx2=rx1 et ry2=ry1 si non Attribuer P_0_1_1

on peut appliquer le meme principe pour les autres dimensions
- Pour les dimensions physiques: il faudra detecter les regtangles (svg:rect), height et width
- pour les dimensions acteurs: ???

NB: Pour que cela puisse marcher les elements doivent étre dégrouper pour pouvoir détécter les ellements (ellipse, rect) dans le scripte XML 
