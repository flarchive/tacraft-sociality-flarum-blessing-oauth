<?php

namespace Blessing\Flarum;

use Flarum\Api\Resource\ForumResource;
use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js'),

    new Extend\Locales(__DIR__.'/locale'),

    (new Extend\Routes('forum'))
        // Use a dedicated path: other OAuth extensions register /auth/{provider},
        // which shadows a static /auth/blessing route in FastRoute.
        ->get('/blessing-oauth/callback', 'auth.blessing', Controllers\PassportController::class),

    (new Extend\Routes('api'))
        ->post('/blessing-oauth/icon', 'blessing-oauth.icon.upload', Api\UploadIconController::class)
        ->delete('/blessing-oauth/icon', 'blessing-oauth.icon.delete', Api\DeleteIconController::class),

    (new Extend\ApiResource(ForumResource::class))
        ->fields(Api\AddForumAttributes::class),
];
