# Repology Export
This project contains a script to generate a SQLite database from the [Repology](https://repology.org) API.

## Requirements

- Linux, macOS or Windows Subsystem for Linux (WSL)
- [Node.js](https://nodejs.org) 18+

## Usage

### Install dependencies

```sh
npm install
```

### Generate data

The following command will generate a SQLite database named `repology.db`. Since the Repology API is rate-limited, this process may take a while.

```sh
npm start
```

At the moment of writing, Repology has about ~1285 project pages, aproximately 257k projects, which results in a ~450MB database.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.