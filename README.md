# Flarum OAuth Client

This Flarum extension lets you log in with a [Blessing Skin](https://blessing.netlify.app/) account.

> This extension is a fork of [`fof/passport`](https://github.com/FriendsOfFlarum/passport).

## Requirements

- Flarum 2.x (`flarum/core` `^2.0`)
- PHP 8.3 or newer
- A Blessing Skin installation with an OAuth client

> **Flarum 1.x:** use the `2.0.x` release line. This branch targets Flarum 2.x only.

## Installation

Run Composer:

```
composer require tacraft-sociality/flarum-blessing-oauth
```

> The package was renamed from `blessing/flarum-oauth-client`. Remove the old package first
> (`composer remove blessing/flarum-oauth-client`) so the extension is not loaded twice.

## Configuration

In the extension settings, you have to fill the following data:

Setting | Example | Description
--- | --- | ---
Blessing Skin base URL | `https://example.com/` | `<your blessing skin>/`
OAuth application id | `1` | The integer *Client ID* you've made in the Blessing Skin
OAuth application secret | `abcdefghijABCDEFGHIJabcdefghijABCDEFGHIJ` | The *Client secret* provided by Blessing Skin once you created the OAuth client
Label for login button | Login with Blessing Skin | Label to place on the login button
Icon for login button | `far fa-id-card` | FontAwesome icon to place on the login button.
Icon image URL | `https://example.com/logo.png` | Optional. When set, this image is shown instead of the FontAwesome icon.
Upload icon image | `logo.png` | Optional. Uploads a local PNG/JPEG/WebP image (max 2 MB) to Flarum's assets and uses it as the button icon.
Alert messages | Custom text | Optional. Every frontend alert (linked, generic error, state, provider, token, userinfo, identifier) can be overridden in the admin settings. Empty fields use the bundled translations.

**Hint:** When creating the OAuth client in Blessing Skin, don't forget to set the `redirect` value to `<your flarum install>/blessing-oauth/callback`.

Full tutorial can be found: [Working with Flarum](https://blessing.netlify.app/en/flarum.html).

## How it works

Clicking the login button sends the user to Blessing Skin's OAuth authorization page.
After the callback, existing users are logged in and redirected back to the page they came from.
New users get Flarum's sign-up modal, pre-filled with the email and nickname returned by Blessing Skin.

## Blessing Skin compatibility

The extension works with both common Blessing Skin OAuth implementations:

- **Blessing Skin's built-in Passport API**, which exposes the user at `/api/user` and uses the
  `User.Read` scope.
- **The `blessing-skin-auth-service` plugin**, which exposes an OIDC style `/oauth/userinfo`
  endpoint and uses the `profile` and `email` scopes.

It requests `profile email User.Read`; each server ignores the scopes it does not know. The user
profile is fetched from `/oauth/userinfo` first and falls back to `/api/user` for older setups.

If a login fails, Flarum's log contains a line starting with `[blessing-oauth-client]` that describes
the failing step (provider error, state mismatch, token exchange or user profile request).

## Upgrading to Flarum 2.x

A Flarum 2 compatible release of this extension is required for Flarum 2.x. There are no settings or
database changes, so existing accounts linked to Blessing Skin keep working.

For extension developers, the port involved the following changes:

- Forum attributes are registered through `Flarum\Api\Resource\ForumResource` and `Flarum\Extend\ApiResource`,
  replacing the removed `ForumSerializer` extender.
- `PassportController` uses the Flarum 2 `ResponseFactory::make()` signature and passes a validated
  `returnTo` path, so users return to where they started after logging in.
- The frontend is built with `flarum-webpack-config` v3 and consumes modules from the
  `flarum.reg` registry instead of the removed `flarum.core.compat` map.
- Admin settings are registered with `app.registry` instead of `app.extensionData`.

## Development

```
cd js
yarn install
yarn build
```

`yarn dev` starts a watch build. Type checking (`yarn check-typings`) reads Flarum's typings from
`../vendor/flarum/core/js/dist-typings`, so run `composer install` in the extension root first.

`js/dist` is listed in `.gitignore`, but the built bundles are distributed with the extension, so
remember to force-add them when committing a build: `git add -f js/dist`.

## License

MIT License
