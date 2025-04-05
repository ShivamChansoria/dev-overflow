# App Directory

This directory contains the core application code for the Next.js application. It follows the Next.js 13+ App Router convention.

## Structure

- `(root)/` - Contains the main application routes and pages
- `api/` - Contains API route handlers for backend functionality
- `(auth)/` - Authentication-related routes and pages
- `fonts/` - Custom font files used in the application
- `layout.tsx` - Root layout component that wraps all pages
- `database.ts` - Database configuration and connection setup
- `globals.css` - Global CSS styles

## Purpose

The app directory is the main entry point of the application where:

- Routes are defined using the file-system based routing
- API endpoints are implemented
- Global layouts and styles are configured
- Authentication flows are handled
- Database connections are managed

## Flow

1. The application starts from `layout.tsx` which provides the base structure
2. Routes are handled based on the directory structure
3. API routes in the `api/` directory handle backend requests
4. Authentication flows are managed through the `(auth)/` directory
5. Global styles from `globals.css` are applied throughout the application
