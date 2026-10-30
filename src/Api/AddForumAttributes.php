<?php

namespace Blessing\Flarum\Api;

use Flarum\Api\Schema;
use Flarum\Locale\TranslatorInterface;
use Flarum\Settings\SettingsRepositoryInterface;

/**
 * Exposes the login button configuration to the forum frontend.
 *
 * In Flarum 2.x the forum payload is described by API resources instead of
 * serializers, so these attributes are registered as fields of
 * {@see \Flarum\Api\Resource\ForumResource}.
 */
class AddForumAttributes
{
    public function __construct(
        protected TranslatorInterface $translator,
        protected SettingsRepositoryInterface $settings
    ) {
    }

    /**
     * @return array<int, \Tobyz\JsonApiServer\Schema\Field\Field>
     */
    public function __invoke(): array
    {
        $fields = [
            Schema\Str::make('blessing-oauth-client.loginTitle')
                ->get(fn (): string => (string) ($this->settings->get('blessing-oauth-client.button_title')
                    ?: $this->translator->trans('blessing-oauth-client.api.default-login-button-title'))),

            Schema\Str::make('blessing-oauth-client.loginIcon')
                ->get(fn (): string => (string) ($this->settings->get('blessing-oauth-client.button_icon')
                    ?: 'far fa-id-card')),

            Schema\Str::make('blessing-oauth-client.loginIconImage')
                ->get(function (): string {
                    // An uploaded icon takes precedence over the manual URL.
                    $uploaded = trim((string) $this->settings->get('blessing-oauth-client.button_icon_upload_url'));

                    if ($uploaded !== '' && preg_match('#^(https?://|/)#i', $uploaded)) {
                        return $uploaded;
                    }

                    $url = trim((string) $this->settings->get('blessing-oauth-client.button_icon_image'));

                    // Only allow absolute http(s) URLs or root-relative paths.
                    if ($url === '' || ! preg_match('#^(https?://|/)#i', $url)) {
                        return '';
                    }

                    return $url;
                }),
        ];

        // Custom alert texts. An empty setting means "use the translation".
        $messages = [
            'messageLinked' => 'message_linked',
            'messageError' => 'message_error',
            'messageErrorState' => 'message_error_state',
            'messageErrorProvider' => 'message_error_provider',
            'messageErrorToken' => 'message_error_token',
            'messageErrorUserinfo' => 'message_error_userinfo',
            'messageErrorIdentifier' => 'message_error_identifier',
        ];

        foreach ($messages as $attribute => $setting) {
            $fields[] = Schema\Str::make('blessing-oauth-client.'.$attribute)
                ->get(fn (): string => trim((string) $this->settings->get(
                    'blessing-oauth-client.'.$setting,
                    ''
                )));
        }

        return $fields;
    }
}
