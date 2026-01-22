# Database Seeders

This folder contains database seeders for populating initial data in the Home Nursing Service System.

## Available Seeders

### DataSeeder
- **Location**: `config/DataSeeder.java`
- **Purpose**: Seeds initial service types (General Checkup, Wound Care, Medication Management, etc.)
- **Runs**: Automatically on application startup if no service types exist

### BranchSeeder
- **Location**: `seeder/BranchSeeder.java`
- **Purpose**: Seeds Malaysian branches for the home nursing service
- **Runs**: Automatically on application startup if no branches exist
- **Includes**: 6 Malaysian branches across major cities:
  - Kuala Lumpur Central Clinic (Kuala Lumpur)
  - Penang Healthcare Hub (Penang)
  - Johor Bahru Medical Center (Johor)
  - Kuching Wellness Center (Sarawak)
  - Kota Kinabalu Health Services (Sabah)
### NurseSeeder
- **Location**: `seeder/NurseSeeder.java`
- **Purpose**: Seeds Malaysian nurses for testing and development
- **Runs**: Automatically on application startup if no nurses exist (after BranchSeeder)
- **Includes**: 5 Malaysian nurses with different specializations:
  - Siti Abdullah (General Nursing) - Kuala Lumpur
  - Ahmad Razak (Wound Care Specialist) - Kuala Lumpur
  - Priya Devi (Pediatric Nursing) - Penang
  - Wei Tan (Mental Health Nursing) - Penang
  - Fatimah Omar (Diabetes Care Specialist) - Johor Bahru

## Usage

Seeders run automatically when the Spring Boot application starts. They check if data already exists before seeding to avoid duplicates.

To manually trigger seeding or modify seed data, edit the respective seeder files and restart the application.

## Adding New Seeders

1. Create a new class in this folder implementing `CommandLineRunner`
2. Add `@Component` annotation
3. Implement the `run` method with your seeding logic
4. Add necessary repository dependencies via `@Autowired`