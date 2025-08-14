#!/usr/bin/env node

import { createApp } from './app.js';
import { PerformanceMonitor, logMemoryUsage } from './utils/helpers.js';

interface PerformanceTestResult {
  testName: string;
  duration: number;
  memoryUsage: { used: number; total: number; percentage: number };
  cacheSizes: { [key: string]: number };
  success: boolean;
  error?: string;
}

class PerformanceTestSuite {
  private results: PerformanceTestResult[] = [];
  private monitor: PerformanceMonitor;

  constructor() {
    this.monitor = new PerformanceMonitor();
  }

  async runAllTests(): Promise<void> {
    console.log("Performance Test Suite Başlatılıyor");
    console.log("=".repeat(60));

    await this.testBasicPerformance();
    await this.testCachingPerformance();
    await this.testBatchProcessingPerformance();
    await this.testAsyncProcessingPerformance();
    await this.testMemoryOptimization();
    await this.testLargeDatasetPerformance();

    this.printResults();
  }

  private async testBasicPerformance(): Promise<void> {
    console.log("\n1. Temel Performance Testi");

    this.monitor.start();

    logMemoryUsage('Test Start');

    try {
      const app = createApp({
        enableCaching: false,
        enableAsyncProcessing: false,
        enableMemoryMonitoring: false
      });

      await app.run({
        filterByIzmir: true,
        generateJson: true,
        generateMarkdown: true,
        debug: false
      });

      this.monitor.checkpoint('Complete');

      const memoryUsage = this.getMemoryUsage();

      this.results.push({
        testName: 'Basic Performance',
        duration: this.monitor.getElapsedTime(),
        memoryUsage,
        cacheSizes: app.getCacheSizes(),
        success: true
      });

      console.log(` Tamamlandı: ${this.monitor.getElapsedTime()}ms`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.push({
        testName: 'Basic Performance',
        duration: this.monitor.getElapsedTime(),
        memoryUsage: this.getMemoryUsage(),
        cacheSizes: {},
        success: false,
        error: errorMessage
      });
      console.log(`Hata: ${errorMessage}`);
    }
  }

  private async testCachingPerformance(): Promise<void> {
    console.log("\n2. Cache Performance Testi");

    this.monitor.start();

    logMemoryUsage('Cache Test Start');

    try {
      const app = createApp({
        enableCaching: true,
        enableAsyncProcessing: false,
        enableMemoryMonitoring: false
      });

      await app.run({
        filterByIzmir: true,
        generateJson: true,
        generateMarkdown: true,
        debug: false
      });

      this.monitor.checkpoint('First Run');

      await app.run({
        filterByIzmir: true,
        generateJson: true,
        generateMarkdown: true,
        debug: false
      });

      this.monitor.checkpoint('Second Run');
      const memoryUsage = this.getMemoryUsage();

      this.results.push({
        testName: 'Caching Performance',
        duration: this.monitor.getElapsedTime(),
        memoryUsage,
        cacheSizes: app.getCacheSizes(),
        success: true
      });

      console.log(` Tamamlandı: ${this.monitor.getElapsedTime()}ms`);
      console.log(`   Cache boyutları:`, app.getCacheSizes());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.push({
        testName: 'Caching Performance',
        duration: this.monitor.getElapsedTime(),
        memoryUsage: this.getMemoryUsage(),
        cacheSizes: {},
        success: false,
        error: errorMessage
      });
      console.log(`Hata: ${errorMessage}`);
    }
  }

  private async testBatchProcessingPerformance(): Promise<void> {
    console.log("\n3. Batch Processing Performance Testi");
    this.monitor.start();
    logMemoryUsage('Batch Test Start');

    try {
      const app = createApp({
        enableCaching: true,
        enableAsyncProcessing: false,
        enableMemoryMonitoring: false,
        batchSize: {
          parser: 500,
          filter: 500,
          report: 250
        }
      });

      await app.run({
        filterByIzmir: true,
        generateJson: true,
        generateMarkdown: true,
        debug: false
      });

      this.monitor.checkpoint('Complete');
      const memoryUsage = this.getMemoryUsage();

      this.results.push({
        testName: 'Batch Processing Performance',
        duration: this.monitor.getElapsedTime(),
        memoryUsage,
        cacheSizes: app.getCacheSizes(),
        success: true
      });

      console.log(` Tamamlandı: ${this.monitor.getElapsedTime()}ms`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.push({
        testName: 'Batch Processing Performance',
        duration: this.monitor.getElapsedTime(),
        memoryUsage: this.getMemoryUsage(),
        cacheSizes: {},
        success: false,
        error: errorMessage
      });
      console.log(`Hata: ${errorMessage}`);
    }
  }

  private async testAsyncProcessingPerformance(): Promise<void> {
    console.log("\n4. Async Processing Performance Testi");
    this.monitor.start();
    logMemoryUsage('Async Test Start');

    try {
      const app = createApp({
        enableCaching: true,
        enableAsyncProcessing: true,
        enableMemoryMonitoring: false
      });

      await app.run({
        filterByIzmir: true,
        generateJson: true,
        generateMarkdown: true,
        debug: false
      });

      this.monitor.checkpoint('Complete');
      const memoryUsage = this.getMemoryUsage();

      this.results.push({
        testName: 'Async Processing Performance',
        duration: this.monitor.getElapsedTime(),
        memoryUsage,
        cacheSizes: app.getCacheSizes(),
        success: true
      });

      console.log(` Tamamlandı: ${this.monitor.getElapsedTime()}ms`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.push({
        testName: 'Async Processing Performance',
        duration: this.monitor.getElapsedTime(),
        memoryUsage: this.getMemoryUsage(),
        cacheSizes: {},
        success: false,
        error: errorMessage
      });
      console.log(`Hata: ${errorMessage}`);
    }
  }

  private async testMemoryOptimization(): Promise<void> {
    console.log("\n5. Memory Optimization Testi");
    this.monitor.start();
    logMemoryUsage('Memory Test Start');

    try {
      const app = createApp({
        enableCaching: true,
        enableAsyncProcessing: true,
        enableMemoryMonitoring: true,
        batchSize: {
          parser: 100,
          filter: 100,
          report: 50
        }
      });

      // Multiple runs to test memory management
      for (let i = 0; i < 3; i++) {
        await app.run({
          filterByIzmir: true,
          generateJson: true,
          generateMarkdown: true,
          debug: false
        });
        
        if (i < 2) {
          app.clearAllCaches();
        }
      }

      this.monitor.checkpoint('Complete');
      const memoryUsage = this.getMemoryUsage();

      this.results.push({
        testName: 'Memory Optimization',
        duration: this.monitor.getElapsedTime(),
        memoryUsage,
        cacheSizes: app.getCacheSizes(),
        success: true
      });

      console.log(` Tamamlandı: ${this.monitor.getElapsedTime()}ms`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.push({
        testName: 'Memory Optimization',
        duration: this.monitor.getElapsedTime(),
        memoryUsage: this.getMemoryUsage(),
        cacheSizes: {},
        success: false,
        error: errorMessage
      });
      console.log(`Hata: ${errorMessage}`);
    }
  }

  private async testLargeDatasetPerformance(): Promise<void> {
    console.log("\n6. Large Dataset Performance Testi");
    this.monitor.start();
    logMemoryUsage('Large Dataset Test Start');

    try {
      const app = createApp({
        enableCaching: true,
        enableAsyncProcessing: true,
        enableMemoryMonitoring: true,
        batchSize: {
          parser: 2000,
          filter: 2000,
          report: 1000
        }
      });

      await app.run({
        filterByIzmir: false, // Process all data
        generateJson: true,
        generateMarkdown: true,
        debug: false
      });

      this.monitor.checkpoint('Complete');
      const memoryUsage = this.getMemoryUsage();

      this.results.push({
        testName: 'Large Dataset Performance',
        duration: this.monitor.getElapsedTime(),
        memoryUsage,
        cacheSizes: app.getCacheSizes(),
        success: true
      });

      console.log(` Tamamlandı: ${this.monitor.getElapsedTime()}ms`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.push({
        testName: 'Large Dataset Performance',
        duration: this.monitor.getElapsedTime(),
        memoryUsage: this.getMemoryUsage(),
        cacheSizes: {},
        success: false,
        error: errorMessage
      });
      console.log(`Hata: ${errorMessage}`);
    }
  }

  private getMemoryUsage(): { used: number; total: number; percentage: number } {
    const memUsage = process.memoryUsage();
    const used = Math.round(memUsage.heapUsed / 1024 / 1024);
    const total = Math.round(memUsage.heapTotal / 1024 / 1024);
    const percentage = Math.round((used / total) * 100);
    
    return { used, total, percentage };
  }

  private printResults(): void {
    console.log("\n" + "=".repeat(60));
    console.log("PERFORMANCE TEST SONUÇLARI");
    console.log("=".repeat(60));

    const successfulTests = this.results.filter(r => r.success);
    const failedTests = this.results.filter(r => !r.success);

    if (successfulTests.length > 0) {
      console.log("\nBAŞARILI TESTLER:");
      successfulTests.forEach(result => {
        console.log(`\n${result.testName}:`);
        console.log(`  Süre: ${result.duration}ms`);
        console.log(`  Bellek: ${result.memoryUsage.used}MB / ${result.memoryUsage.total}MB (${result.memoryUsage.percentage}%)`);
        console.log(`  Cache Boyutları:`, result.cacheSizes);
      });
    }

    if (failedTests.length > 0) {
      console.log("\n BAŞARISIZ TESTLER:");
      failedTests.forEach(result => {
        console.log(`\n${result.testName}:`);
        console.log(`  Hata: ${result.error}`);
        console.log(`  Süre: ${result.duration}ms`);
      });
    }

    // Performance summary
    if (successfulTests.length > 0) {
      const avgDuration = successfulTests.reduce((sum, r) => sum + r.duration, 0) / successfulTests.length;
      const avgMemory = successfulTests.reduce((sum, r) => sum + r.memoryUsage.percentage, 0) / successfulTests.length;
      
      console.log("\n  PERFORMANCE ÖZETİ:");
      console.log(`  Ortalama Süre: ${Math.round(avgDuration)}ms`);
      console.log(`  Ortalama Bellek Kullanımı: ${Math.round(avgMemory)}%`);
      console.log(`  Başarı Oranı: ${Math.round((successfulTests.length / this.results.length) * 100)}%`);
    }

    console.log("\n" + "=".repeat(60));
  }
}

async function main(): Promise<void> {
  const testSuite = new PerformanceTestSuite();
  await testSuite.runAllTests();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
