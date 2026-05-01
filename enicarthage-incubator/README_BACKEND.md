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
*   `controller/` : Points d'entrée de l'API (REST Controllers).
*   `service/` : Logique métier de l'application.
*   `repository/` : Interface avec la base de données (Spring Data JPA).
*   `model/` : Entités JPA.
*   `dto/` : Data Transfer Objects pour les échanges API.
*   `config/` : Configurations Spring (CORS, Security, etc.).
*   `security/` : Gestion de l'authentification et du JWT.

## 🛠️ Installation et Configuration

### Prérequis
*   Java 17 installé.
*   Maven installé.
*   MySQL Server en cours d'exécution.

### Configuration
1.  Clonez le dépôt.
2.  Configurez la base de données dans le fichier `src/main/resources/application.yml` :
    ```yaml
    spring:
      datasource:
        url: jdbc:mysql://localhost:3306/enicarthage_db
        username: votre_utilisateur
        password: votre_mot_de_passe
    ```
3.  Modifiez la clé secrète JWT si nécessaire :
    ```yaml
    app:
      jwt:
        secret: votre_cle_secrete_longue_et_securisee
    ```

### Lancement
Pour démarrer l'application, utilisez la commande Maven suivante à la racine du projet :
```bash
mvn spring-boot:run
```
L'application sera accessible sur : `http://localhost:8085`

## 📡 Endpoints Principaux

| Ressource | Endpoint | Description |
| :--- | :--- | :--- |
| **Auth** | `/api/auth/**` | Inscription, Connexion, Refresh Token |
| **Users** | `/api/users/**` | Gestion des profils utilisateurs |
| **Projects** | `/api/projects/**` | Soumission et suivi des projets |
| **Programs** | `/api/programs/**` | Gestion des programmes d'incubation |
| **Events** | `/api/events/**` | Calendrier des événements |
| **News** | `/api/news/**` | Actualités de l'incubateur |
| **Notifications** | `/api/notifications/**` | Alertes et notifications en temps réel |
| **Stats** | `/api/stats/**` | Tableaux de bord et statistiques |

## 📦 Build
Pour générer le fichier JAR exécutable :
```bash
mvn clean package
```
Le fichier sera généré dans le dossier `target/`.

---
© 2026 ENICarthage Incubator.
