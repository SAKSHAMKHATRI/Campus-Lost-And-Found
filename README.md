🔎 Campus Lost & Found

A web-based Campus Lost & Found platform designed to make reporting, browsing, and matching lost and found items easier within a campus environment.

The application provides a simple interface where users can create an account, log in, post lost or found item reports, browse recent reports, and view smart match suggestions between lost and found items.

The main goal of the project is to provide a centralized and organized way for students to report missing belongings and discover items that may have been found by other campus users.

Live Demo: https://campuslost-and-found.netlify.app/

📌 Table of Contents

Project Overview

Problem Statement

Objectives

Key Features

Application Flow

Screenshots

Login Page

Sign Up Page

Dashboard

Recent Reports

Lost Items

Found Items

Smart Match Suggestions

How Smart Matching Works

User Journey

Technology Stack

Project Structure

Installation & Setup

Future Enhancements

Conclusion

🚀 Project Overview

Campus Lost & Found is a web application created to help students and campus users manage lost and found belongings through a single platform.

In a college environment, students may lose items such as mobile phones, wallets, ID cards, bags, keys, books, documents, or other personal belongings. At the same time, another student may find the item without knowing who owns it.

Instead of depending only on verbal communication, notice boards, or scattered messages, this application provides a centralized place where users can post and browse reports.

The application allows users to:

Create a new account

Log in to the platform

Access a personal dashboard

Post lost-item reports

Post found-item reports

Browse available lost and found reports

View recent reports

Receive smart match suggestions

View match scores and understand why two reports may be related

❗ Problem Statement

Lost belongings are common in campus environments, but finding them again can be difficult.

Traditional methods may involve:

Asking friends or classmates

Posting messages in group chats

Checking physical notice boards

Contacting campus offices

Manually searching through lost-and-found records

These methods can make it difficult to keep track of reports and identify a possible match between a lost item and a found item.

The Campus Lost & Found system addresses this problem by organizing reports digitally and providing a Smart Match Suggestions feature that compares lost and found reports.

🎯 Objectives

The main objectives of the project are:

Provide a centralized platform for campus lost-and-found reports.

Allow users to create accounts and log in.

Allow users to report both lost and found items.

Make recent reports easy to discover.

Provide separate browsing for lost and found items.

Automatically compare lost and found reports.

Display potential matches with a score.

Explain the factors contributing to a match score.

Provide a simple and user-friendly interface.

Reduce the time and effort required to find lost belongings.

✨ Key Features

🔐 1. User Authentication

The application provides Login and Sign Up functionality.

New users can create an account, while existing users can log in and continue to their dashboard.

Login

The Login page provides fields for the user's email and password and gives access to the main dashboard.

Sign Up

The Sign Up page allows a new campus user to create an account before using the reporting features.

🏠 2. Dashboard

After logging in, the user can access the main dashboard.

The dashboard acts as the central navigation point for the application and provides access to features such as:

Browsing reports

Posting lost items

Posting found items

Viewing recent reports

Checking smart match suggestions

Viewing the user's own reports

🕒 3. Recent Reports

The Recent Reports section helps users quickly see the latest lost and found activity.

This can be useful when a user has recently lost something and wants to check whether another person has already reported finding it.

🔎 4. Lost & Found Browsing

Users can browse reported lost and found items and review information associated with each report.

The browsing experience helps users narrow their search and identify reports that may relate to their missing belongings.

🤖 5. Smart Match Suggestions

One of the key features of the application is Smart Match Suggestions.

The application compares lost-item reports with found-item reports and calculates a match score.

According to the application's match explanation, the score can consider factors such as:

Same category: +3

Same campus zone: +2

Dates within 3 days: +2

Shared description keyword: +1

The system then uses the resulting score to classify match strength:

8–10: Strong

5–7: Possible

1–4: Weak

This allows users to focus first on the most promising matches instead of manually comparing every report.

📸 Screenshots

The screenshots below demonstrate the major user-facing parts of the application.

1. Login Page

The Login Page is the entry point for existing users.

Users enter their registered email address and password to continue to their dashboard.



Main elements

Campus Lost & Found branding

Email input

Password input

Login button

Create an account option

The page keeps the authentication process simple and provides a clear path for both existing and new users.

2. Sign Up Page

The Sign Up Page allows new users to create an account.



After registration, users can log in and access the main application.

Main purpose

Create a new user account

Collect required registration information

Provide navigation back to Login

3. Dashboard

The Dashboard is the main area available after authentication.



It provides users with a central place to access the application's major features.

Users can navigate towards:

Dashboard

Browse

Match Suggestions

My Reports

Lost-item posting

Found-item posting

4. Recent Reports

The Recent Reports page displays recently submitted lost and found reports.



This feature is useful for users who want to quickly check the latest activity on campus.

For example, if a student recently lost a wallet, they can check recent reports to see whether a corresponding found report has been posted.

5. Lost Items

The Lost Items section contains reports submitted by users who have lost belongings.



A lost-item report can provide information that helps other users identify the missing belonging.

Typical information can include:

Item name

Category

Description

Location

Date

Image, where provided

Additional details

6. Found Items

The Found Items section contains reports submitted by users who have found belongings.



A found-item report gives other users an opportunity to identify whether the reported item could be the one they lost.

The information provided in these reports can also be used by the Smart Match Suggestions feature.

7. Smart Match Suggestions

The Smart Match Suggestions page compares lost-item and found-item reports to identify potentially related items.



The page explains that every lost item is compared with every found item and that matches are scored out of 10.

The interface also provides a "How the score works" explanation so users can understand how the matching score is calculated.

The page groups possible matches into:

Strong: 8–10

Possible: 5–7

Weak: 1–4

If there are not enough reports to create a match, the page clearly informs the user that at least one lost item and one found item are required.

This makes the matching process transparent instead of showing a score without explaining where it came from.

🔄 Application Flow

The overall user flow of the application is:

                    ┌─────────────────┐
                    │    Start App    │
                    └────────┬────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │    Login / Sign Up  │
                  └──────────┬──────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │     Dashboard   │
                    └────────┬────────┘
                             │
             ┌───────────────┼────────────────┐
             │               │                │
             ▼               ▼                ▼
       ┌───────────┐   ┌─────────────┐  ┌──────────────┐
       │ Lost Items│   │ Found Items │  │Recent Reports│
       └─────┬─────┘   └──────┬──────┘  └──────┬───────┘
             │                │                │
             └────────────────┼────────────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │ Smart Match Engine  │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │ Match Suggestions   │
                   │ Score: 0–10         │
                   └─────────────────────┘

🤖 How Smart Matching Works

The Smart Match feature is designed to reduce the amount of manual comparison required from users.

The basic process is:

Lost Reports
     │
     ▼
Compare with Found Reports
     │
     ├── Same Category
     ├── Same Campus Zone
     ├── Date Difference
     └── Shared Description Keyword
     │
     ▼
Calculate Match Score
     │
     ▼
Classify Match Strength
     │
     ├── 8–10 → Strong
     ├── 5–7  → Possible
     └── 1–4  → Weak
     │
     ▼
Display Best Matches First

Example

Suppose a user reports a lost item in a particular category and campus zone.

If a found-item report has:

The same category

The same campus zone

A date within three days

A shared keyword in the description

the system can assign points based on those matching factors.

The total score is then used to communicate how strong the potential match is.

👤 User Journey

A typical user journey looks like this:

Step 1 — Create an Account

A new user opens the application and registers through the Sign Up page.

Step 2 — Login

The user enters their registered credentials on the Login page.

Step 3 — Open Dashboard

After authentication, the user reaches the Dashboard.

Step 4 — Report an Item

If the user has lost an item, they can submit a lost-item report.

If they have found an item, they can submit a found-item report.

Step 5 — Browse Reports

The user can browse available lost and found reports.

Step 6 — Check Recent Reports

The user can check recently submitted reports for newly reported belongings.

Step 7 — Check Match Suggestions

The Smart Match Suggestions section compares available lost and found reports and presents potential matches.

Step 8 — Evaluate the Match

The user can review the match score and the factors contributing to it.

This helps the user decide whether a found report may correspond to their lost item.

🧩 Main Modules

1. Authentication Module

Handles:

User registration

User login

Access to the application after authentication

2. Lost Item Module

Handles:

Creating lost-item reports

Displaying lost reports

Providing information about lost belongings

3. Found Item Module

Handles:

Creating found-item reports

Displaying found reports

Providing information about found belongings

4. Recent Reports Module

Displays the latest reports so users can quickly discover recent lost and found activity.

5. Smart Matching Module

Compares lost and found reports and calculates a score based on the matching criteria implemented by the application.

The score helps prioritize potentially relevant matches.

🛠️ Technology Stack

Based on the current project structure, the application is organized as a web frontend using:

Frontend

HTML

CSS

JavaScript

Deployment

Netlify

Development Tools

Visual Studio Code

Git / GitHub

Browser Developer Tools

📁 Project Structure

The project is organized into HTML pages, CSS, JavaScript, and screenshots.

Campus-Lost-And-Found/
│
├── css/
│   └── ...
│
├── js/
│   └── ...
│
├── screenshots/
│   ├── dashboard.png
│   ├── found.png
│   ├── login.png
│   ├── lost.png
│   ├── match.png
│   ├── recent-reports.png
│   └── signup.png
│
├── .vscode/
│
├── admin.html
├── browse.html
├── dashboard.html
├── index.html
├── matches.html
├── post-item.html
├── signup.html
└── README.md

The screenshots directory contains the application screenshots used throughout this README.

💻 Installation & Setup

1. Clone the Repository

git clone <repository-url>

2. Open the Project

Navigate into the project directory:

cd Campus-Lost-And-Found

3. Run the Application

Because the project is a web application consisting of HTML, CSS, and JavaScript files, it can be opened using a local development server.

For example, in Visual Studio Code, the project can be run using a local server such as Live Server.

Open:

index.html

and start the application.

4. Live Version

The deployed version is available here:

https://campuslost-and-found.netlify.app/

🔒 Security Considerations

Authentication and user-related functionality should be handled carefully in a production environment.

Important considerations include:

Secure password handling

Input validation

Authentication checks

Authorization for protected actions

Avoiding exposure of sensitive user information

Secure storage of application credentials

Sensitive credentials should never be committed directly to a public repository.

📈 Future Enhancements

The project can be extended with additional features.

🔔 Notifications

Users could receive notifications when a potentially matching found item is reported.

🤖 Improved AI-Based Matching

The current score-based matching approach could be expanded with machine learning or AI to compare:

Item descriptions

Images

Locations

Dates

Categories

Additional contextual information

📍 Location-Based Search

Users could search for reports near a particular campus location.

📷 Image-Based Matching

Users could upload an image of a lost item and the system could identify visually similar found-item reports.

💬 User Communication

A secure messaging feature could allow users to communicate regarding a potential match.

📊 Admin Dashboard

Administrators could manage:

User accounts

Reports

Suspicious reports

Resolved cases

Report status

✅ Report Status Tracking

Reports could be assigned statuses such as:

Active
Under Review
Potential Match
Matched
Resolved
Closed

This would make it easier to track the complete lifecycle of a lost or found item.

🌟 Advantages of the System

The Campus Lost & Found platform provides several benefits:

Centralized lost and found reporting

Easy account creation and login

Separate lost and found reports

Quick access to recent reports

Smart match suggestions

Transparent match scoring

Simple and clean user interface

Reduced manual searching

Potential for AI-powered improvements

🎓 Use Cases

The system is especially useful in:

Colleges

Universities

Hostels

Libraries

Campus offices

Student activity areas

Laboratories

Cafeterias

Sports facilities

Campus events

Example Use Case

A student loses their wallet on campus.

The student logs into the application.

They submit a lost-item report.

Another student later finds a wallet and submits a found-item report.

The application compares the two reports.

If the reports share relevant characteristics, a potential match can appear under Smart Match Suggestions.

The original user can review the match score and matching factors.

This creates a structured digital workflow for reconnecting lost belongings with their owners.

🧪 Testing

The application should be tested using different scenarios.

Authentication Testing

Valid login

Invalid login

New user registration

Empty input validation

Incorrect credentials

Report Testing

Creating a lost-item report

Creating a found-item report

Viewing reports

Browsing reports

Checking recent reports

Matching Testing

No lost/found reports available

Only lost reports available

Only found reports available

Both lost and found reports available

Strong match

Possible match

Weak match

UI Testing

Navigation

Buttons and links

Form validation

Responsive layout

Error messages

Screenshot/image rendering

📸 Complete Application Screenshots

Feature

Screenshot

Login Page

login.png

Sign Up Page

signup.png

Dashboard

dashboard.png

Recent Reports

recent-reports.png

Lost Items

lost.png

Found Items

found.png

Smart Match Suggestions

match.png

These screenshots demonstrate the major user-facing screens of the Campus Lost & Found application.

🚀 Conclusion

Campus Lost & Found provides a centralized digital platform for reporting and discovering lost and found belongings within a campus environment.

The application covers the complete basic workflow from user authentication and item reporting to browsing reports and checking potential matches.

A key feature of the project is the Smart Match Suggestions system. Instead of requiring users to manually compare every lost and found report, the application calculates a match score based on relevant report characteristics and presents the strongest potential matches first.

The project provides a practical foundation that can be further improved with AI-based matching, image recognition, notifications, location-based search, messaging, and advanced administration features.

Overall, the application demonstrates how a simple web-based system can solve a real-world campus problem by making lost-and-found management more organized, searchable, and efficient.

👨‍💻 Project Information

Project: Campus Lost & Found

Type: Web Application

Purpose: Digital management of campus lost and found items

Primary Users: Students and campus users

Deployment: Netlify

Status: Academic / Development Project
