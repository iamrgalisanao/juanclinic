<?php

namespace App\Services;

use App\Models\NotificationSetting;
use Illuminate\Support\Facades\Config;

class NotificationSettingsManager
{
    /**
     * Load notification settings for the current tenant and branch.
     */
    public function loadSettings(): void
    {
        if (!app()->bound('tenant')) {
            return;
        }

        $tenantId = app('tenant')->id;
        $branchId = app()->bound('branch') ? app('branch')->id : null;

        /** @var \Illuminate\Database\Eloquent\Collection<int, NotificationSetting> $settings */
        $settings = NotificationSetting::where('tenant_id', $tenantId)
            ->where(function ($query) use ($branchId) {
                $query->where('branch_id', $branchId)
                      ->orWhereNull('branch_id');
            })
            ->where('is_active', true)
            ->get();

        foreach ($settings as $setting) {
            if ($setting instanceof NotificationSetting) {
                $this->applySetting($setting);
            }
        }
    }

    /**
     * Apply a specific notification setting to the Laravel configuration.
     */
    protected function applySetting(NotificationSetting $setting): void
    {
        switch ($setting->channel) {
            case 'mail':
                $this->applyMailSetting($setting);
                break;
            case 'sms':
                $this->applySmsSetting($setting);
                break;
        }
    }

    /**
     * Configure the mail driver for the tenant.
     */
    protected function applyMailSetting(NotificationSetting $setting): void
    {
        $config = $setting->config;
        
        if ($setting->provider === 'smtp') {
            Config::set('mail.mailers.smtp.host', $config['host'] ?? '');
            Config::set('mail.mailers.smtp.port', $config['port'] ?? 587);
            Config::set('mail.mailers.smtp.encryption', $config['encryption'] ?? 'tls');
            Config::set('mail.mailers.smtp.username', $config['username'] ?? '');
            Config::set('mail.mailers.smtp.password', $config['password'] ?? '');
            Config::set('mail.from.address', $config['from_address'] ?? '');
            Config::set('mail.from.name', $config['from_name'] ?? '');
            
            // Set default mailer to smtp for this request
            Config::set('mail.default', 'smtp');
        }
    }

    /**
     * Configure the SMS provider for the tenant.
     */
    protected function applySmsSetting(NotificationSetting $setting): void
    {
        $config = $setting->config;
        
        // We can inject these into services.php dynamically
        Config::set("services.{$setting->provider}", $config);
    }
}
