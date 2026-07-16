# API design draft

- `POST /projects`: create tax-year project.
- `POST /projects/{id}/source-files`: upload and hash source file.
- `POST /projects/{id}/parse`: run broker adapter.
- `GET /projects/{id}/transactions`: review normalized transactions.
- `POST /projects/{id}/exchange-rates/resolve`: retrieve or override rates.
- `POST /projects/{id}/calculate`: create immutable calculation run.
- `POST /projects/{id}/exports`: generate draft/final package subject to exceptions.
