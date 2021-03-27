
**L'algorithme qui permet de générer les dimensions existentielles des objets se fait de la maniére suivante :

-->la distribution des objets : 

P = Physique

A = Acteur

C = Concept

R = Rapport


--> création des objets "P"

P_0 englobe tous les autres objets "P"

P_0 englobe P_0_1
  
P_0_1 englobe P_0_2

Et même principe pour les autres "P"


--> création des objets "A" 

A_0 

A_1

A_2


--> création des objets "C"

C_0 c'est le concept mére de tous les autres concepts 

si C_0_1 alors Ce concept est la fille du C_0, le cas pour que les autres conceptes 

jusqu'a C_0_n 

finsi 


--> Création des rapports

"R" C'est l'interaction entre les objets "A" "C" "P"

si {d:'R';o:'A_1';s:'P_0';p:'C_0_2'}  alors "VRAI" 

si {d:'R';o:'A_0';s:'P_0';p:'C_0_1'}  alors "VRAI"  

si {d:'R';o:'A_2';s:'P_0';p:'C_0_3'}  alors "VRAI" 

