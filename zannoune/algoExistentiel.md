1. Détecter automatiquement les concepts et leur attribuer une dimension:
- Faire une lecture du fichier XML
- Détecter toutes les ellipses (Svg: ellipse)
- Trier les ellipses de la plus grande a la plus petite en fonction du rx et Ry
- Attribution du P _0 a l'ellipse avec un rx et Ry max
- Attribuer P 0 _1 à l'ellipse avec un rx1rx max et Ry1 Ry max
- Incrémenter P 0 _1 (P 0 _1+1) si rx2=rx1 et Ry2=Ry1 sinon attribuer P 0 1 _1

on peut appliquer le même principe pour les autres dimensions
- Pour les dimensions physiques: il faudra détecter les rectangles (Svg: rect), height et width
- pour les dimensions acteurs: ???

NB: Pour que cela puisse marcher les éléments doivent être dégroupé pour pouvoir détecter les éléments (ellipse, rect) dans le scripte XML