# ENICarthage Incubator - Backend

Ce dépôt contient le code source du backend pour la plateforme **ENICarthage Incubator**. Il est construit avec Spring Boot et fournit les API REST nécessaires au fonctionnement de l'application.

## 🚀 Technologies Utilisées

*   **Framework:** Spring Boot 3.2.5
*   **Langage:** Java 17
*   **Base de données:** MySQL
*   **Sécurité:** Spring Security & JSON Web Token (JJWT 0.12.6)
*   **Migration de base de données:** Flyway
*   **Gestion de dépendances:** Maven
*   **Notifications:** Spring Mail (SMTP)
*   **Utilitaires:** Lombok

## 📁 Structure du Projet

Le projet suit une architecture standard Spring Boot :
*   `src/main/java/com/enicarthage/incubator/controller/` : Points d'entrée de l'API (REST Controllers).
*   `src/main/java/com/enicarthage/incubator/service/` : Logique métier de l'application.
*   `src/main/java/com/enicarthage/incubator/repository/` : Interface avec la base de données (Spring Data JPA).
*   `src/main/java/com/enicarthage/incubator/model/` : Entités JPA.
*   `src/main/java/com/enicarthage/incubator/dto/` : Data Transfer Objects pour les échanges API.
*   `src/main/java/com/enicarthage/incubator/config/` : Configurations Spring (CORS, Security, etc.).
*   `src/main/java/com/enicarthage/incubator/security/` : Gestion de l'authentification et du JWT.

## 🛠️ Installation et Configuration

### Prérequis
*   **Java 17** ou supérieur.
*   **Maven 3.6+**.
*   **MySQL 8.0+**.

### Configuration
1.  Configurez votre base de données MySQL.
2.  Mettez à jour les paramètres dans `src/main/resources/application.yml` :
    ```yaml
    spring:
      datasource:
        url: jdbc:mysql://localhost:3306/enicarthage_db
        username: root
        password: votre_mot_de_passe
    ```
3.  Vérifiez la configuration du serveur mail et la clé secrète JWT dans le même fichier.

### Lancement
Exécutez la commande suivante à la racine du projet :
```bash
mvn spring-boot:run
```
Le serveur démarrera par défaut sur le port **8085**.

## 📡 API Endpoints

| Domaine | Base URL | Fonctions |
| :--- | :--- | :--- |
| **Authentification** | `/api/auth` | Login, Register, Refresh Token |
| **Utilisateurs** | `/api/users` | Profils, Rôles, Gestion admin |
| **Projets** | `/api/projects` | Soumission, Validation, Liste |
| **Programmes** | `/api/programs` | Incubation, Sessions |
| **Événements** | `/api/events` | Calendrier, Inscriptions |
| **Actualités** | `/api/news` | Articles, Blog |
| **Notifications** | `/api/notifications` | Alertes système |
| **Statistiques** | `/api/stats` | Données analytiques |

## 📦 Build et Déploiement
Pour compiler le projet et générer un artefact :
```bash
mvn clean package
```
Le fichier `.jar` généré sera situé dans le dossier `target/`.

---
© 2026 ENICarthage Incubator.
