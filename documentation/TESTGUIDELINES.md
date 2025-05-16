# Testing Guidelines

## Testing Strategy

The test suites require multiple sets of data, from users, community, messages, etc. To test this behaviour, we need to create multiple users to simulate different kinds of behaviour needed for the application features. For example, message POST controller tests require an inbox and multiple users to test for the access control. In order to streamline the test writing process, we need to start by setting the naming convention and populate the initial data for the tests.

### Testing Data

The primary strategy is to create a script to populate the database that serves as the primary cornerstone for all GET requests and access control checks. This reduces the time on writing future tests, which improves testing efficiency. To further streamline the process and improve testing maintainability, we need to create a naming convention and differentiate between seeded data and data created in the test suites.

#### Initial Data

The data is manually populated by running the populateDB.ts script and will persist permanently in the database. This initial data is used to test for functionalities that require a set of data to handle complex access control. For example, the message POST requires a user, either a community or DM and checks its participation state validity. This initial data serves as a stable foundation to test GET requests and is used for access control checks. Initial data should never be edited in the test suites. The only exception to mutate the initial data is when adding related relational data in its field, for example, adding a participant in the participants field.

#### Test Data

All data that is created inside the test suites is considered testing data. The main function of test data is to test PUT and DELETE requests in its test suites and should not effect other test suites. It is also important to not that the test data should always be deleted efter running the test suites.

#### Naming Convention

The naming convention is divided into three segments. Each segment provides information on the usage and type of the data.

`[usage][schematype][id]`

#### Naming Convention for Initial Data

- The name should start with the word 'seed'.
- The second word should specify its data type, for example, 'user' is used for the user data.
- The third word specifies its ID number in ascending order; the first item should start with 1.

Examples for multiple seed data of user type:

- seeduser1
- seeduser2

##### Naming Convention for Test Data

- The name should start with the word 'test'.
- The second word should specify its data type, for example, 'user' is used for the user data.
- The third word specifies its ID number in ascending order; the first item should start with 1.

Example for multiple test data of user type:

- testuser1
- testuser2

##### Naming Convention exceptions

While the naming convention should be used for all fields of the data, including URL fields, we need to define how to write the values in some fields that conflict with the convention. In most cases, fields allow all the characters used in the naming convention, but, some limit and require certain characters and patterns.

##### Alphabetical only

In alphabetical only fields, replace the id with its word equivalent, for example, '1' should be replaced with 'one'.

Examples:

- seeduser1 -> seeduserone
- testuser12 -> testuseronetwo
- seeduser123 -> seeduseroneonethree

##### Length limit

Most values won't exceed the length limit, but when they do, we need to reduce the length by removing the vowels from the first and second words. This helps the value to stay within the length limit and enables us to follow the convention.

Example:

- seeduser1 -> sdusr1.
- testcommunity1 -> tstcmmnty1.

###### What if the length still exceeds the maximum length?

In these cases, use only the first letter of the object name for the second word.

Example

- testuser1 -> tstu1.
- seedcommunity -> sdc1.

##### Special pattern requirements

In some fields, there are some requirements that are needed to pass the validation. In these cases, consider whether it is feasible to partially comply with the guidelines or if a radical change is needed.

For example, the password field requires the value to contain an uppercase letter, a lowercase letter, a number, and a special character. In this case, it is feasible to partially follow the naming convention by capitalising the second word prepended with a special character.

Example:

- seeduserone -> seed@User1

In other cases, like a phone number field, it is not feasible to partially follow the guidelines, and it is recommended to give them a special treatment.

Example:

- seednumberone -> 12345678

#### Testing Data Examples

```
const user = {
 username: seeduser1,
 password: seed@User1,
 phoneNumber: 12345678,
 email: seeduser1@email.com
}
```
