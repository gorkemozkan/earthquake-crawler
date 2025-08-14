/**
 * Report generation service
 */
import { formatTurkishDate, generateTimestamp } from '../utils/helpers.js';
import { TIMEZONE_CONFIG, FILE_PATTERNS } from '../config/constants.js';
export class ReportGeneratorService {
    timezoneConfig;
    constructor() {
        this.timezoneConfig = TIMEZONE_CONFIG;
    }
    /**
     * Generate JSON report
     * @param earthquakes - Array of earthquakes
     * @param metadata - Report metadata
     * @returns JSON report object
     */
    generateJsonReport(earthquakes, metadata = {}) {
        const { source, isFiltered = false } = metadata;
        return {
            source: source || 'KOERI',
            count: earthquakes.length,
            isFiltered,
            generatedAt: new Date().toISOString(),
            items: earthquakes.map(earthquake => ({
                datetime: earthquake.datetime,
                date: earthquake.date,
                time: earthquake.time,
                latitude: earthquake.latitude,
                longitude: earthquake.longitude,
                depth_km: earthquake.depth_km,
                md: earthquake.md,
                ml: earthquake.ml,
                mw: earthquake.mw,
                preferred_mag: earthquake.preferred_mag,
                location: earthquake.location,
                province: earthquake.province,
                status: earthquake.status,
                source: earthquake.source,
            }))
        };
    }
    /**
     * Generate Markdown report
     * @param earthquakes - Array of earthquakes
     * @param metadata - Report metadata
     * @returns Markdown report string
     */
    generateMarkdownReport(earthquakes, metadata = {}) {
        const { source, isFiltered = false } = metadata;
        const now = formatTurkishDate(new Date(), this.timezoneConfig);
        const title = isFiltered
            ? 'Kandilli Rasathanesi İzmir Deprem Raporu'
            : 'Kandilli Rasathanesi Deprem Raporu';
        const subtitle = isFiltered
            ? '**Filtre:** Sadece İzmir ve çevresi depremleri'
            : '';
        let markdown = `# ${title}\n\n`;
        markdown += `**Son Güncelleme:** ${now}\n\n`;
        markdown += `**Veri Kaynağı:** ${source || 'KOERI'}\n\n`;
        markdown += `**Son Veri Çekme:** ${now}\n\n`;
        if (subtitle)
            markdown += `${subtitle}\n\n`;
        markdown += `**Toplam Deprem Sayısı:** ${earthquakes.length}\n\n`;
        // Data range information
        if (earthquakes.length > 0) {
            markdown += this.generateDataRangeInfo(earthquakes);
        }
        // Summary statistics
        if (earthquakes.length > 0) {
            markdown += this.generateSummaryStatistics(earthquakes);
        }
        // Earthquake table
        markdown += this.generateEarthquakeTable(earthquakes);
        // Detailed information
        markdown += this.generateDetailedInformation(earthquakes);
        return markdown;
    }
    /**
     * Generate summary statistics section
     * @param earthquakes - Array of earthquakes
     * @returns Markdown statistics section
     */
    generateSummaryStatistics(earthquakes) {
        const magnitudes = earthquakes.map(item => item.preferred_mag).filter((mag) => mag != null);
        const depths = earthquakes.map(item => item.depth_km).filter((depth) => depth != null);
        if (magnitudes.length === 0)
            return '';
        const maxMag = Math.max(...magnitudes);
        const minMag = Math.min(...magnitudes);
        const avgMag = (magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length).toFixed(2);
        let stats = `## Özet İstatistikler\n\n`;
        stats += `- **En Yüksek Büyüklük:** ${maxMag}\n`;
        stats += `- **En Düşük Büyüklük:** ${minMag}\n`;
        stats += `- **Ortalama Büyüklük:** ${avgMag}\n`;
        if (depths.length > 0) {
            const maxDepth = Math.max(...depths);
            const minDepth = Math.min(...depths);
            const avgDepth = (depths.reduce((a, b) => a + b, 0) / depths.length).toFixed(2);
            stats += `- **En Derin:** ${maxDepth} km\n`;
            stats += `- **En Sığ:** ${minDepth} km\n`;
            stats += `- **Ortalama Derinlik:** ${avgDepth} km\n`;
        }
        stats += `\n`;
        return stats;
    }
    /**
     * Generate data range information section
     * @param earthquakes - Array of earthquakes
     * @returns Markdown data range section
     */
    generateDataRangeInfo(earthquakes) {
        const dates = earthquakes.map(item => new Date(item.datetime)).sort((a, b) => a.getTime() - b.getTime());
        const earliest = dates[0];
        const latest = dates[dates.length - 1];
        if (!earliest || !latest) {
            return '';
        }
        const formatDate = (date) => formatTurkishDate(date, this.timezoneConfig);
        let rangeInfo = `## Veri Aralığı\n\n`;
        rangeInfo += `- **En Eski Deprem:** ${formatDate(earliest)}\n`;
        rangeInfo += `- **En Yeni Deprem:** ${formatDate(latest)}\n`;
        rangeInfo += `- **Veri Aralığı:** ${earliest.toLocaleDateString('tr-TR')} - ${latest.toLocaleDateString('tr-TR')}\n\n`;
        return rangeInfo;
    }
    /**
     * Generate earthquake table section
     * @param earthquakes - Array of earthquakes
     * @returns Markdown table section
     */
    generateEarthquakeTable(earthquakes) {
        let table = `## Deprem Listesi\n\n`;
        table += `| Tarih | Saat | Büyüklük | Derinlik (km) | Enlem | Boylam | Konum | Durum |\n`;
        table += `|-------|------|----------|---------------|-------|--------|-------|-------|\n`;
        earthquakes.forEach(item => {
            const date = item.date;
            const time = item.time;
            const mag = item.preferred_mag || '-';
            const depth = item.depth_km || '-';
            const lat = item.latitude || '-';
            const lon = item.longitude || '-';
            const location = item.location || '-';
            const status = item.status || '-';
            table += `| ${date} | ${time} | ${mag} | ${depth} | ${lat} | ${lon} | ${location} | ${status} |\n`;
        });
        table += `\n`;
        return table;
    }
    /**
     * Generate detailed information section
     * @param earthquakes - Array of earthquakes
     * @returns Markdown detailed section
     */
    generateDetailedInformation(earthquakes) {
        let details = `## Detaylı Bilgiler\n\n`;
        earthquakes.forEach((item, index) => {
            details += `### ${index + 1}. Deprem\n\n`;
            details += `- **Tarih ve Saat:** ${item.date} ${item.time}\n`;
            details += `- **ISO Zaman:** ${item.datetime}\n`;
            details += `- **Konum:** ${item.latitude}, ${item.longitude}\n`;
            details += `- **Derinlik:** ${item.depth_km || '-'} km\n`;
            details += `- **Büyüklükler:** MD: ${item.md || '-'}, ML: ${item.ml || '-'}, MW: ${item.mw || '-'}\n`;
            details += `- **Tercih Edilen Büyüklük:** ${item.preferred_mag || '-'}\n`;
            details += `- **Yer:** ${item.location}\n`;
            if (item.province) {
                details += `- **İl:** ${item.province}\n`;
            }
            details += `- **Durum:** ${item.status || '-'}\n`;
            details += `- **Kaynak:** ${item.source}\n\n`;
        });
        return details;
    }
    /**
     * Generate filename for report
     * @param isFiltered - Whether the report is filtered
     * @returns Generated filename
     */
    generateFilename(isFiltered = false) {
        return 'README.md';
    }
    /**
     * Set timezone configuration
     * @param config - Timezone configuration
     */
    setTimezoneConfig(config) {
        this.timezoneConfig = { ...this.timezoneConfig, ...config };
    }
}
//# sourceMappingURL=ReportGeneratorService.js.map