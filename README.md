# Twitter Locator Themes

Twitter locator themes est une application développé en Node.js offrant une nouvelle manière de lire ses tweets.
Elle traite un flux Twitter continu à partir d'un thème choisi et les place sur une carte du monde avec la localisation du tweet.

## Objectifs et choix

L'objectif est de permettre à un utilisateur de suivre les tweets parlant d'un thème qu'il aime, en temps réel et de pouvoir visualiser qui à posté ce tweet et ou il se trouve dans le monde. Il aura alors la possibilité de voir le tweet en question sur le profil twitter de la personne ou directement de le retweeter.

Cet outil est donc très utile si on veut analyser la fréquence et le lieu d'apparition des tweets pour un sujet donné. 

J'ai décidé de partir sur ce sujet car il me semblait interessant de proposer une nouvelle façon de consulter ses tweets. Avec cet outil on a un premier niveau de tri avec la selection d'un thème précis puis un deuxième avec la géolocalisation des utilisateurs twitter. 

Dans une première version de l'outil, il ne proposait que de voir la ville de l'utilisateur qui postait des tweets à titre indicatif. Puis pour faire évoluer le projet, j'ai décidé de lier l'API MapBox (qui me permet d'obtenir des coordonnées à partir d'une ville) et l'API Google Maps (pour la gestion de la carte et des markers) pour rendre plus visuel la localisation des tweets. Pour finir, j'ai ajouté la fonction qui permet de retweeter directement sur l'outil.

En conclusion, les trois versions de ce projet on contribué à ce qu'il soit maintenant simple d'utilisation avec un seul champ de recherche, utile pour une nouvelle manière de lire ses tweets et pratique avec le retweet pour montrer qu'on soutient le tweet en question.


## Outils utilisés pour le développement 

- Node.js pour le serveur
- Socket.IO pour les requêtes entre le serveur et le client
- API Stream de Twitter pour récupérer les tweets
- API MapBox pour obtenir des coordonnées à partir de nom de ville
- API Google Maps pour la gestion de la carte


## Installation

- Clonage du projet ou téléchargement du projet en cliquant sur le bouton en haut à droite

- Se placer dans le dossier parent et effectuer la commande suivant pour installer tous les node modules : 

```bash
$ npm install
```

- Une fois terminé, ouvrir le fichier index.js et remplir vos informations fournies par Twitter : 

```bash

const cfg = {
    consumer_key: 'ENTRER_VOTRE_CONSUMER_KEY',
    consumer_secret: 'ENTRER_VOTRE_CONSUMER_SECRET',
    access_token_key: 'ENTRER_VOTRE_ACCESS_TOKEN_KEY',
    access_token_secret: 'ENTRER_VOTRE_ACCESS_TOKEN_SECRET'
};

```
- Une fois renseigné, ouvrir un terminal de commande à l'endroit du dossier parent et lancer la commande suivante pour lancer le serveur : 

```bash
$ node index.js
```

- Ensuite lancez un navigateur web et rendez vous à l'adresse suivante : 

```bash
http://localhost:5000/
```

vous devriez alors voir dans votre console que le serveur et le client sont connecté. Vous pouvez donc commencer à utiliser l'application

## Utilisation

Une fois les étapes précédentes effectuées rendez vous sur votre navigateur. Vous avez un champs de recherche en haut à gauche de la carte. Renseignez votre thème favoris puis cliquez sur chercher. La recherche est alors lancée et va ressortir uniquement les tweets traitant de ce thème en temps réel.

Une fois un tweet trouvé, l'image de l'utilisateur qui l'a posté va apparaitre sur la carte, à l'emplacement de sa localisation. Vous pouvez alors cliquer sur l'image pour découvrir le tweet en bas à gauche.

Deux options s'offres à vous :

- soit le visualiser sur le compte twitter de la personne
- soit le retweeter directement

Vous pouvez laisser tourner le serveur et continuer de suivre les personnes qui parlent de votre thème choisi.

ENJOY!








