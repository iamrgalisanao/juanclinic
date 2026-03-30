<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

class VersionService
{
    /**
     * Get the Platform Version (CalVer) from the root VERSION file.
     * 
     * @return string
     */
    public static function getPlatform(): string
    {
        $path = base_path('../VERSION');
        if (File::exists($path)) {
            return trim(File::get($path));
        }
        return '0.0.0';
    }

    /**
     * Get the API Version (SemVer).
     * 
     * @return string
     */
    public static function getApiVersion(): string
    {
        return 'v1.15.0'; // Incremented due to Hybrid Versioning & HL7 Gateway
    }

    /**
     * Get the Full System Version info.
     * 
     * @return array
     */
    public static function getInfo(): array
    {
        return [
            'platform' => self::getPlatform(),
            'api' => self::getApiVersion(),
            'full' => sprintf('JuanClinic %s (%s)', self::getPlatform(), self::getApiVersion()),
            'environment' => config('app.env'),
            'build_date' => date('Y-m-d H:i:s'),
        ];
    }
}
