<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\PediatricService;
use App\Models\PediatricGrowthStandard;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PediatricServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $pediatricService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->pediatricService = new PediatricService();
        
        // Seed standard for 6 months
        PediatricGrowthStandard::create([
            'source' => 'WHO',
            'gender' => 'M',
            'metric' => 'weight_for_age',
            'age_months' => 6,
            'l' => 0.0370,
            'm' => 8.3963,
            's' => 0.1057
        ]);

        PediatricGrowthStandard::create([
            'source' => 'WHO',
            'gender' => 'F',
            'metric' => 'weight_for_age',
            'age_months' => 6,
            'l' => 0.0370,
            'm' => 7.3059,
            's' => 0.1052
        ]);
    }

    /** @test */
    public function it_calculates_correct_z_score_for_median_weight()
    {
        // For a Boy at 6 months, median weight is 8.3963 kg
        $zScore = $this->pediatricService->calculateZScore('M', 'weight_for_age', 6, 8.3963);
        
        // Z-Score for median should be exactly 0
        $this->assertEqualsWithDelta(0, $zScore, 0.001);
        
        $percentile = $this->pediatricService->zScoreToPercentile($zScore);
        $this->assertEqualsWithDelta(50, $percentile, 1.0);
    }

    /** @test */
    public function it_calculates_correct_z_score_for_girl_median_weight()
    {
        // For a Girl at 6 months, median weight is 7.3059 kg
        $zScore = $this->pediatricService->calculateZScore('F', 'weight_for_age', 6, 7.3059);
        
        $this->assertEqualsWithDelta(0, $zScore, 0.001);
        
        $percentile = $this->pediatricService->zScoreToPercentile($zScore);
        $this->assertEqualsWithDelta(50, $percentile, 1.0);
    }

    /** @test */
    public function it_calculates_bmi_correctly()
    {
        // Weight 10kg, Height 75cm
        $bmi = $this->pediatricService->calculateBMI(10, 75);
        
        // BMI = 10 / (0.75^2) = 10 / 0.5625 = 17.777
        $this->assertEqualsWithDelta(17.777, $bmi, 0.001);
    }
}
