# Custom domains

Every web service gets a free address such as `https://my-app.skyhost.tech`. You can add your own domains too.

## 1. Add the domain

Open the service → **Domains** and enter it, e.g. `www.example.com`
(API: `POST /api/v1/services/{id}/domains`).

## 2. Create the DNS records

At your registrar (Hostinger, Namecheap, Cloudflare…), create the records SKYHOST shows:

1. A **TXT** record `_skyhost-challenge.www.example.com` with the `skyhost-verify=…` value — it proves you own
   the domain.
2. A **CNAME** `www` pointing to your service address, or an **A** record with the server IP for a root domain
   such as `example.com`.

Click **Verify** (`POST /api/v1/domains/{id}/verify`). DNS changes take from a few minutes to a few hours.

## 3. HTTPS

Once verified, a Let's Encrypt certificate is issued automatically and renewed before it expires. The status
goes from **Pending** to **Certificate issued**.

## Common problems

- **Verification fails** — make sure there is only one A record for the name. Registrars often add a default
  "parking" record that must be deleted.
- **Cloudflare** — set the record to **DNS only** (grey cloud) until the certificate is issued.
