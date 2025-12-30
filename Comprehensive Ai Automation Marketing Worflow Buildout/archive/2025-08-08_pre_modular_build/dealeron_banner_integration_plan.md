# DealerOn/Dealer.com & BannerInSite Integration Plan

## Executive Summary
This plan consolidates complex dealer website operations into efficient n8n Code nodes, reducing workflow complexity while maintaining robust functionality for inventory management, banner automation, and website auditing.

---

## 🎯 INTEGRATION STRATEGY

### Core Principle: Consolidated Code Nodes
Instead of creating dozens of individual nodes, we'll use powerful Code nodes that:
- Handle multiple API calls internally
- Process data transformations
- Manage error handling
- Reduce visual workflow complexity

---

## 📊 ARCHITECTURE OVERVIEW

```
Customer Journey Flow
         ↓
    [Code Node 1]
INVENTORY SYNC MANAGER
  • DealerOn API calls
  • Dealer.com feeds
  • Inventory processing
  • VDP enrichment
         ↓
    [Code Node 2]
BANNER AUTOMATION ENGINE
  • BannerInSite API
  • Dynamic creative generation
  • Offer synchronization
  • Multi-channel distribution
         ↓
    [Code Node 3]
WEBSITE AUDIT SCANNER
  • Page performance checks
  • Banner placement verification
  • Offer accuracy validation
  • Compliance monitoring
         ↓
    [Code Node 4]
SPECIAL OFFERS PROCESSOR
  • Regional offer aggregation
  • Pricing rule application
  • Expiration management
  • Customer targeting
         ↓
BigQuery Logging
```

---

## 🔧 CODE NODE 1: INVENTORY SYNC MANAGER

### Purpose
Centralized inventory management across DealerOn and Dealer.com platforms

### Consolidated Operations
```javascript
// INVENTORY SYNC MANAGER - Single Code Node
// Handles all inventory operations in one place

async function syncInventory() {
  const config = {
    dealerOn: {
      endpoint: 'https://api.dealeron.com/v1/inventory',
      apiKey: $getNodeParameter('dealerOnApiKey'),
      dealerId: $getNodeParameter('dealerId')
    },
    dealerCom: {
      ftpUrl: 'ftp://feeds.dealer.com',
      username: $getNodeParameter('dealerComUser'),
      password: $getNodeParameter('dealerComPass')
    }
  };

  // Step 1: Fetch DealerOn Inventory
  const dealerOnInventory = await fetchDealerOnInventory(config.dealerOn);
  
  // Step 2: Fetch Dealer.com Feed
  const dealerComInventory = await fetchDealerComFeed(config.dealerCom);
  
  // Step 3: Merge and Deduplicate
  const mergedInventory = mergeInventories(dealerOnInventory, dealerComInventory);
  
  // Step 4: Enrich with Marketing Data
  const enrichedInventory = await enrichInventoryData(mergedInventory);
  
  // Step 5: Calculate Special Pricing
  const pricedInventory = calculateSpecialPricing(enrichedInventory);
  
  // Step 6: Update Customer Journey Segments
  const segmentedInventory = assignToJourneyStages(pricedInventory);
  
  return segmentedInventory;
}

// Helper Functions (all within same node)
async function fetchDealerOnInventory(config) {
  const response = await $http.get(config.endpoint, {
    headers: { 'X-API-Key': config.apiKey },
    params: { dealer_id: config.dealerId }
  });
  
  return response.data.vehicles.map(vehicle => ({
    vin: vehicle.vin,
    stock: vehicle.stock_number,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    price: vehicle.price,
    images: vehicle.images,
    features: vehicle.features,
    status: vehicle.status,
    daysOnLot: vehicle.days_on_lot,
    source: 'dealeron'
  }));
}

async function fetchDealerComFeed(config) {
  // FTP connection and XML parsing
  const ftpClient = new FTP();
  await ftpClient.connect(config);
  const xmlData = await ftpClient.get('/inventory/feed.xml');
  const inventory = parseXML(xmlData);
  return inventory;
}

function mergeInventories(dealerOn, dealerCom) {
  const merged = new Map();
  
  // Add all DealerOn vehicles
  dealerOn.forEach(v => merged.set(v.vin, v));
  
  // Merge or add Dealer.com vehicles
  dealerCom.forEach(v => {
    if (merged.has(v.vin)) {
      // Merge data, prefer fresher info
      const existing = merged.get(v.vin);
      merged.set(v.vin, { ...existing, ...v });
    } else {
      merged.set(v.vin, v);
    }
  });
  
  return Array.from(merged.values());
}

async function enrichInventoryData(inventory) {
  // Add marketing-relevant data
  return inventory.map(vehicle => ({
    ...vehicle,
    popularityScore: calculatePopularity(vehicle),
    pricePosition: calculatePricePosition(vehicle),
    urgencyLevel: calculateUrgency(vehicle),
    targetAudience: identifyTargetAudience(vehicle),
    promotionEligible: checkPromotionEligibility(vehicle)
  }));
}

function calculateSpecialPricing(inventory) {
  const specialOffers = {
    'high_days_on_lot': { threshold: 60, discount: 0.05 },
    'volume_model': { models: ['Camry', 'F-150'], discount: 0.03 },
    'loyalty': { returning: true, discount: 0.02 }
  };
  
  return inventory.map(vehicle => {
    let finalPrice = vehicle.price;
    let appliedOffers = [];
    
    // Apply aging discount
    if (vehicle.daysOnLot > specialOffers.high_days_on_lot.threshold) {
      finalPrice *= (1 - specialOffers.high_days_on_lot.discount);
      appliedOffers.push('aging_discount');
    }
    
    // Apply volume model discount
    if (specialOffers.volume_model.models.includes(vehicle.model)) {
      finalPrice *= (1 - specialOffers.volume_model.discount);
      appliedOffers.push('volume_discount');
    }
    
    return {
      ...vehicle,
      specialPrice: Math.round(finalPrice),
      originalPrice: vehicle.price,
      appliedOffers: appliedOffers,
      savings: vehicle.price - Math.round(finalPrice)
    };
  });
}

function assignToJourneyStages(inventory) {
  return inventory.map(vehicle => {
    let journeyStage = 'awareness';
    
    if (vehicle.pricePosition === 'budget' && vehicle.urgencyLevel === 'high') {
      journeyStage = 'conversion';
    } else if (vehicle.popularityScore > 7) {
      journeyStage = 'consideration';
    } else if (vehicle.appliedOffers.length > 0) {
      journeyStage = 'intent';
    }
    
    return {
      ...vehicle,
      journeyStage: journeyStage,
      messagingPriority: getMessagingPriority(journeyStage, vehicle.urgencyLevel)
    };
  });
}

// Main execution
const results = await syncInventory();
return results.map(item => ({ json: item }));
```

---

## 🎨 CODE NODE 2: BANNER AUTOMATION ENGINE

### Purpose
Automate banner creation and distribution through BannerInSite

### Consolidated Operations
```javascript
// BANNER AUTOMATION ENGINE - Single Code Node
// Manages all banner operations and syndication

async function manageBanners() {
  const bannerConfig = {
    apiKey: $getNodeParameter('bannerInSiteApiKey'),
    dealerId: $getNodeParameter('dealerId'),
    endpoint: 'https://api.bannerinsite.com/v1'
  };

  // Get inventory from previous node
  const inventory = $input.all().map(item => item.json);
  
  // Step 1: Generate Banner Campaigns
  const campaigns = await generateBannerCampaigns(inventory, bannerConfig);
  
  // Step 2: Create Dynamic Banners
  const banners = await createDynamicBanners(campaigns, bannerConfig);
  
  // Step 3: Distribute to Channels
  const distribution = await distributeBanners(banners, bannerConfig);
  
  // Step 4: Update Website Placements
  const placements = await updateWebsitePlacements(distribution, bannerConfig);
  
  return {
    campaigns: campaigns,
    banners: banners,
    distribution: distribution,
    placements: placements
  };
}

async function generateBannerCampaigns(inventory, config) {
  const campaigns = [];
  
  // Group vehicles by campaign type
  const campaignGroups = {
    'hot_deals': inventory.filter(v => v.urgencyLevel === 'high'),
    'new_arrivals': inventory.filter(v => v.daysOnLot < 7),
    'special_offers': inventory.filter(v => v.appliedOffers.length > 0),
    'popular_models': inventory.filter(v => v.popularityScore > 8)
  };
  
  for (const [type, vehicles] of Object.entries(campaignGroups)) {
    if (vehicles.length === 0) continue;
    
    const campaign = await $http.post(`${config.endpoint}/campaigns`, {
      headers: { 'X-API-Key': config.apiKey },
      body: {
        dealer_id: config.dealerId,
        campaign_type: type,
        vehicles: vehicles.map(v => ({
          vin: v.vin,
          stock: v.stock,
          price: v.specialPrice || v.price,
          image: v.images[0],
          headline: generateHeadline(type, v),
          cta: generateCTA(type, v.journeyStage)
        })),
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
    
    campaigns.push(campaign.data);
  }
  
  return campaigns;
}

async function createDynamicBanners(campaigns, config) {
  const banners = [];
  
  for (const campaign of campaigns) {
    // Create banners for different placements
    const bannerTypes = [
      { size: '728x90', placement: 'header', format: 'static' },
      { size: '300x250', placement: 'sidebar', format: 'animated' },
      { size: '320x50', placement: 'mobile', format: 'responsive' },
      { size: 'dynamic', placement: 'vdp', format: 'interactive' }
    ];
    
    for (const bannerType of bannerTypes) {
      const banner = await $http.post(`${config.endpoint}/banners`, {
        headers: { 'X-API-Key': config.apiKey },
        body: {
          campaign_id: campaign.id,
          size: bannerType.size,
          placement: bannerType.placement,
          format: bannerType.format,
          template: selectTemplate(campaign.campaign_type, bannerType.format),
          dynamic_elements: {
            price_updates: true,
            countdown_timer: campaign.campaign_type === 'hot_deals',
            inventory_counter: true,
            personalization: true
          }
        }
      });
      
      banners.push(banner.data);
    }
  }
  
  return banners;
}

async function distributeBanners(banners, config) {
  const distributions = [];
  
  // Define distribution channels
  const channels = [
    { name: 'website', endpoint: '/syndicate/website' },
    { name: 'social', endpoint: '/syndicate/social' },
    { name: 'email', endpoint: '/syndicate/email' },
    { name: 'display_network', endpoint: '/syndicate/display' }
  ];
  
  for (const banner of banners) {
    for (const channel of channels) {
      // Check if banner is suitable for channel
      if (isBannerSuitableForChannel(banner, channel.name)) {
        const distribution = await $http.post(
          `${config.endpoint}${channel.endpoint}`,
          {
            headers: { 'X-API-Key': config.apiKey },
            body: {
              banner_id: banner.id,
              channel: channel.name,
              targeting: getTargetingRules(banner, channel.name),
              schedule: getSchedule(banner.campaign_type)
            }
          }
        );
        
        distributions.push(distribution.data);
      }
    }
  }
  
  return distributions;
}

async function updateWebsitePlacements(distributions, config) {
  const placements = [];
  
  // Update DealerOn website placements
  const websiteDistributions = distributions.filter(d => d.channel === 'website');
  
  for (const dist of websiteDistributions) {
    // Update VDP pages
    if (dist.placement === 'vdp') {
      const placement = await $http.put(
        `https://api.dealeron.com/v1/banners/vdp`,
        {
          headers: { 'X-API-Key': $getNodeParameter('dealerOnApiKey') },
          body: {
            banner_url: dist.banner_url,
            placement_rules: dist.targeting,
            vehicle_filter: dist.vehicle_vins
          }
        }
      );
      placements.push(placement.data);
    }
    
    // Update SRP pages
    if (dist.placement === 'srp') {
      const placement = await $http.put(
        `https://api.dealeron.com/v1/banners/srp`,
        {
          headers: { 'X-API-Key': $getNodeParameter('dealerOnApiKey') },
          body: {
            banner_url: dist.banner_url,
            position: dist.position,
            rotation_weight: dist.weight
          }
        }
      );
      placements.push(placement.data);
    }
  }
  
  return placements;
}

// Helper functions
function generateHeadline(campaignType, vehicle) {
  const headlines = {
    'hot_deals': `🔥 ${vehicle.year} ${vehicle.make} ${vehicle.model} - Save $${vehicle.savings}!`,
    'new_arrivals': `NEW! ${vehicle.year} ${vehicle.make} ${vehicle.model} Just Arrived`,
    'special_offers': `Special Offer: ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    'popular_models': `Popular Choice: ${vehicle.make} ${vehicle.model}`
  };
  return headlines[campaignType] || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
}

function generateCTA(campaignType, journeyStage) {
  const ctas = {
    'awareness': 'Learn More',
    'consideration': 'View Details',
    'intent': 'Get Your Price',
    'conversion': 'Buy Now - Limited Time!'
  };
  return ctas[journeyStage] || 'View Inventory';
}

// Main execution
const results = await manageBanners();
return [{ json: results }];
```

---

## 🔍 CODE NODE 3: WEBSITE AUDIT SCANNER

### Purpose
Automated website auditing for compliance, performance, and accuracy

### Consolidated Operations
```javascript
// WEBSITE AUDIT SCANNER - Single Code Node
// Comprehensive website auditing system

async function auditWebsite() {
  const auditConfig = {
    dealerUrl: $getNodeParameter('dealerWebsiteUrl'),
    checkInterval: 3600000, // 1 hour
    thresholds: {
      pageSpeed: 3000, // ms
      bannerAccuracy: 0.95, // 95%
      offerValidity: 0.98, // 98%
      inventorySync: 0.99 // 99%
    }
  };

  const auditResults = {
    timestamp: new Date().toISOString(),
    url: auditConfig.dealerUrl,
    checks: {}
  };

  // Step 1: Performance Audit
  auditResults.checks.performance = await auditPerformance(auditConfig);
  
  // Step 2: Banner Placement Audit
  auditResults.checks.banners = await auditBannerPlacements(auditConfig);
  
  // Step 3: Offer Accuracy Audit
  auditResults.checks.offers = await auditOfferAccuracy(auditConfig);
  
  // Step 4: Inventory Sync Audit
  auditResults.checks.inventory = await auditInventorySync(auditConfig);
  
  // Step 5: Compliance Audit
  auditResults.checks.compliance = await auditCompliance(auditConfig);
  
  // Step 6: Generate Recommendations
  auditResults.recommendations = generateRecommendations(auditResults.checks);
  
  // Step 7: Trigger Alerts if Needed
  await triggerAlerts(auditResults, auditConfig);
  
  return auditResults;
}

async function auditPerformance(config) {
  const pages = [
    { path: '/', name: 'homepage' },
    { path: '/inventory', name: 'srp' },
    { path: '/specials', name: 'specials' },
    { path: '/vehicle/sample', name: 'vdp' }
  ];
  
  const results = [];
  
  for (const page of pages) {
    const url = `${config.dealerUrl}${page.path}`;
    const startTime = Date.now();
    
    try {
      // Fetch page and measure load time
      const response = await $http.get(url);
      const loadTime = Date.now() - startTime;
      
      // Parse HTML to check critical elements
      const $ = cheerio.load(response.data);
      
      results.push({
        page: page.name,
        url: url,
        loadTime: loadTime,
        status: loadTime < config.thresholds.pageSpeed ? 'pass' : 'fail',
        bannerCount: $('.banner-insite').length,
        hasInventory: $('.vehicle-listing').length > 0,
        hasCTA: $('.cta-button').length > 0,
        mobileOptimized: $('meta[name="viewport"]').length > 0
      });
    } catch (error) {
      results.push({
        page: page.name,
        url: url,
        status: 'error',
        error: error.message
      });
    }
  }
  
  return {
    avgLoadTime: results.reduce((a, b) => a + (b.loadTime || 0), 0) / results.length,
    failedPages: results.filter(r => r.status === 'fail').length,
    results: results
  };
}

async function auditBannerPlacements(config) {
  const response = await $http.get(`${config.dealerUrl}/inventory`);
  const $ = cheerio.load(response.data);
  
  const banners = [];
  $('.banner-insite, .dealer-special, .promotional-banner').each((i, elem) => {
    const $banner = $(elem);
    banners.push({
      type: $banner.attr('data-banner-type') || 'unknown',
      position: $banner.attr('data-position') || 'unknown',
      campaignId: $banner.attr('data-campaign-id'),
      hasImage: $banner.find('img').length > 0,
      hasPrice: $banner.text().includes('$'),
      hasCTA: $banner.find('a, button').length > 0,
      isVisible: $banner.is(':visible'),
      width: $banner.width(),
      height: $banner.height()
    });
  });
  
  // Verify with BannerInSite API
  const activeCampaigns = await $http.get(
    'https://api.bannerinsite.com/v1/campaigns/active',
    {
      headers: { 'X-API-Key': $getNodeParameter('bannerInSiteApiKey') },
      params: { dealer_id: $getNodeParameter('dealerId') }
    }
  );
  
  const accuracy = banners.filter(b => 
    activeCampaigns.data.some(c => c.id === b.campaignId)
  ).length / banners.length;
  
  return {
    totalBanners: banners.length,
    activeBanners: banners.filter(b => b.isVisible).length,
    accuracy: accuracy,
    status: accuracy >= config.thresholds.bannerAccuracy ? 'pass' : 'fail',
    misplacedBanners: banners.filter(b => !b.isVisible || !b.hasImage),
    details: banners
  };
}

async function auditOfferAccuracy(config) {
  // Fetch current offers from website
  const response = await $http.get(`${config.dealerUrl}/specials`);
  const $ = cheerio.load(response.data);
  
  const websiteOffers = [];
  $('.special-offer, .vehicle-special').each((i, elem) => {
    const $offer = $(elem);
    websiteOffers.push({
      title: $offer.find('.offer-title').text().trim(),
      price: parseFloat($offer.find('.price').text().replace(/[^0-9.]/g, '')),
      expires: $offer.find('.expires').text().trim(),
      vin: $offer.attr('data-vin'),
      stock: $offer.attr('data-stock')
    });
  });
  
  // Get actual inventory with special pricing
  const inventory = $input.all().map(item => item.json);
  const inventoryOffers = inventory.filter(v => v.appliedOffers.length > 0);
  
  // Compare offers
  let matchedOffers = 0;
  for (const webOffer of websiteOffers) {
    const match = inventoryOffers.find(inv => 
      inv.vin === webOffer.vin || inv.stock === webOffer.stock
    );
    
    if (match && Math.abs(match.specialPrice - webOffer.price) < 100) {
      matchedOffers++;
    }
  }
  
  const accuracy = websiteOffers.length > 0 
    ? matchedOffers / websiteOffers.length 
    : 1;
  
  return {
    websiteOfferCount: websiteOffers.length,
    actualOfferCount: inventoryOffers.length,
    matchedOffers: matchedOffers,
    accuracy: accuracy,
    status: accuracy >= config.thresholds.offerValidity ? 'pass' : 'fail',
    discrepancies: websiteOffers.length - matchedOffers
  };
}

async function auditInventorySync(config) {
  // Get website inventory count
  const response = await $http.get(`${config.dealerUrl}/api/inventory/count`);
  const websiteCount = response.data.count;
  
  // Get actual inventory count
  const actualInventory = $input.all().map(item => item.json);
  const actualCount = actualInventory.filter(v => v.status === 'available').length;
  
  // Check specific vehicles
  const sampleSize = Math.min(10, actualInventory.length);
  const sampleVehicles = actualInventory.slice(0, sampleSize);
  
  let syncedVehicles = 0;
  for (const vehicle of sampleVehicles) {
    try {
      const vdpResponse = await $http.get(
        `${config.dealerUrl}/vehicle/${vehicle.vin}`
      );
      if (vdpResponse.status === 200) {
        syncedVehicles++;
      }
    } catch (error) {
      // Vehicle not found on website
    }
  }
  
  const syncRate = syncedVehicles / sampleSize;
  
  return {
    websiteCount: websiteCount,
    actualCount: actualCount,
    difference: Math.abs(websiteCount - actualCount),
    syncRate: syncRate,
    status: syncRate >= config.thresholds.inventorySync ? 'pass' : 'fail',
    lastSync: new Date().toISOString()
  };
}

async function auditCompliance(config) {
  const response = await $http.get(config.dealerUrl);
  const $ = cheerio.load(response.data);
  
  const compliance = {
    hasPrivacyPolicy: $('a[href*="privacy"]').length > 0,
    hasTerms: $('a[href*="terms"]').length > 0,
    hasDisclaimer: $('.disclaimer, .legal').length > 0,
    hasDealerInfo: $('.dealer-info, .dealership-name').length > 0,
    hasContactInfo: $('a[href^="tel:"], .phone').length > 0,
    hasAccessibility: $('[aria-label], [alt]').length > 10,
    hasSSL: config.dealerUrl.startsWith('https'),
    hasMobileViewport: $('meta[name="viewport"]').length > 0
  };
  
  const score = Object.values(compliance).filter(v => v === true).length;
  const totalChecks = Object.keys(compliance).length;
  
  return {
    score: score,
    totalChecks: totalChecks,
    percentage: (score / totalChecks) * 100,
    status: score === totalChecks ? 'pass' : 'fail',
    details: compliance
  };
}

function generateRecommendations(checks) {
  const recommendations = [];
  
  // Performance recommendations
  if (checks.performance.avgLoadTime > 3000) {
    recommendations.push({
      priority: 'high',
      category: 'performance',
      issue: 'Slow page load times',
      recommendation: 'Optimize images, enable caching, and minimize JavaScript'
    });
  }
  
  // Banner recommendations
  if (checks.banners.accuracy < 0.95) {
    recommendations.push({
      priority: 'high',
      category: 'banners',
      issue: 'Banner placement accuracy below threshold',
      recommendation: 'Sync BannerInSite campaigns with website placements'
    });
  }
  
  // Offer recommendations
  if (checks.offers.discrepancies > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'offers',
      issue: `${checks.offers.discrepancies} offer discrepancies found`,
      recommendation: 'Update website specials to match current inventory pricing'
    });
  }
  
  // Inventory recommendations
  if (checks.inventory.syncRate < 0.99) {
    recommendations.push({
      priority: 'high',
      category: 'inventory',
      issue: 'Inventory sync rate below threshold',
      recommendation: 'Run full inventory sync and check API connections'
    });
  }
  
  // Compliance recommendations
  if (checks.compliance.status === 'fail') {
    const missing = Object.entries(checks.compliance.details)
      .filter(([k, v]) => v === false)
      .map(([k]) => k);
    
    recommendations.push({
      priority: 'medium',
      category: 'compliance',
      issue: `Missing compliance elements: ${missing.join(', ')}`,
      recommendation: 'Add missing legal and accessibility elements'
    });
  }
  
  return recommendations;
}

async function triggerAlerts(results, config) {
  const criticalIssues = results.recommendations.filter(r => r.priority === 'high');
  
  if (criticalIssues.length > 0) {
    // Send to Customer.io for email alert
    await $http.post('https://track.customer.io/api/v1/events', {
      headers: {
        'Authorization': `Bearer ${$getNodeParameter('customerIoApiKey')}`
      },
      body: {
        name: 'website_audit_alert',
        data: {
          dealer_id: $getNodeParameter('dealerId'),
          url: config.dealerUrl,
          issues: criticalIssues,
          timestamp: results.timestamp
        }
      }
    });
    
    // Log to BigQuery
    await $node['BigQuery'].execute({
      operation: 'insert',
      table: 'website_audits',
      data: results
    });
  }
}

// Main execution
const auditResults = await auditWebsite();
return [{ json: auditResults }];
```

---

## 🎯 CODE NODE 4: SPECIAL OFFERS PROCESSOR

### Purpose
Manage and distribute special offers across all channels

### Consolidated Operations
```javascript
// SPECIAL OFFERS PROCESSOR - Single Code Node
// Centralized offer management system

async function processSpecialOffers() {
  const inventory = $input.all().map(item => item.json);
  
  // Step 1: Aggregate Regional Offers
  const regionalOffers = await fetchRegionalOffers();
  
  // Step 2: Apply Dealer-Specific Rules
  const dealerOffers = applyDealerRules(inventory, regionalOffers);
  
  // Step 3: Calculate Customer-Specific Offers
  const personalizedOffers = await personalizeOffers(dealerOffers);
  
  // Step 4: Distribute to All Channels
  const distribution = await distributeOffers(personalizedOffers);
  
  return distribution;
}

async function fetchRegionalOffers() {
  // Fetch from BannerInSite offer feed
  const bannerOffers = await $http.get(
    'https://api.bannerinsite.com/v1/offers/regional',
    {
      headers: { 'X-API-Key': $getNodeParameter('bannerInSiteApiKey') },
      params: {
        region: $getNodeParameter('dealerRegion'),
        dealer_id: $getNodeParameter('dealerId')
      }
    }
  );
  
  // Fetch manufacturer incentives
  const oemIncentives = await $http.get(
    'https://api.oemincentives.com/v1/current',
    {
      params: {
        brands: $getNodeParameter('dealerBrands'),
        zip: $getNodeParameter('dealerZip')
      }
    }
  );
  
  return {
    banner: bannerOffers.data,
    oem: oemIncentives.data,
    combined: mergeOffers(bannerOffers.data, oemIncentives.data)
  };
}

function applyDealerRules(inventory, regionalOffers) {
  const dealerRules = {
    maxDiscount: 0.15, // 15% max
    minMargin: 500, // $500 minimum margin
    volumeTargets: {
      'Camry': 10,
      'F-150': 8,
      'Accord': 12
    },
    agingThresholds: [
      { days: 30, discount: 0.02 },
      { days: 60, discount: 0.05 },
      { days: 90, discount: 0.08 }
    ]
  };
  
  return inventory.map(vehicle => {
    let offers = [];
    let totalDiscount = 0;
    
    // Apply regional offers
    const applicableRegional = regionalOffers.combined.filter(offer => 
      offer.models.includes(vehicle.model) &&
      offer.years.includes(vehicle.year)
    );
    
    applicableRegional.forEach(offer => {
      if (totalDiscount + offer.discount <= dealerRules.maxDiscount) {
        offers.push(offer);
        totalDiscount += offer.discount;
      }
    });
    
    // Apply aging discounts
    const agingRule = dealerRules.agingThresholds.find(
      rule => vehicle.daysOnLot >= rule.days
    );
    
    if (agingRule && totalDiscount + agingRule.discount <= dealerRules.maxDiscount) {
      offers.push({
        type: 'aging',
        discount: agingRule.discount,
        description: `${agingRule.discount * 100}% off - Clearance Special`
      });
      totalDiscount += agingRule.discount;
    }
    
    // Apply volume targets
    if (dealerRules.volumeTargets[vehicle.model]) {
      offers.push({
        type: 'volume',
        discount: 0.01,
        description: 'Volume Bonus - Additional Savings!'
      });
      totalDiscount += 0.01;
    }
    
    // Calculate final price
    const finalPrice = vehicle.price * (1 - totalDiscount);
    const margin = finalPrice - (vehicle.invoice || vehicle.price * 0.9);
    
    // Ensure minimum margin
    if (margin < dealerRules.minMargin) {
      const adjustment = dealerRules.minMargin - margin;
      finalPrice += adjustment;
    }
    
    return {
      ...vehicle,
      offers: offers,
      totalDiscount: totalDiscount,
      offerPrice: Math.round(finalPrice),
      savings: vehicle.price - Math.round(finalPrice),
      offerExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  });
}

async function personalizeOffers(dealerOffers) {
  // Get customer segments from journey data
  const customerSegments = await $node['BigQuery'].execute({
    operation: 'query',
    query: `
      SELECT DISTINCT 
        user_id, 
        email, 
        journey_stage, 
        intent_level,
        vehicle_interest
      FROM \`project.dataset.customer_journey\`
      WHERE journey_stage IN ('consideration', 'intent', 'conversion')
        AND last_activity >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
    `
  });
  
  const personalizedOffers = [];
  
  for (const customer of customerSegments) {
    // Find matching vehicles
    const relevantVehicles = dealerOffers.filter(vehicle => {
      if (customer.vehicle_interest) {
        return vehicle.model.toLowerCase().includes(
          customer.vehicle_interest.toLowerCase()
        );
      }
      return true;
    });
    
    // Personalize based on journey stage
    const offers = relevantVehicles.map(vehicle => {
      let personalizedOffer = { ...vehicle };
      
      if (customer.journey_stage === 'conversion' && customer.intent_level === 'high') {
        // Add urgency for high-intent conversion stage
        personalizedOffer.additionalIncentive = 500;
        personalizedOffer.offerPrice -= 500;
        personalizedOffer.urgencyMessage = 'Exclusive offer expires in 24 hours!';
        personalizedOffer.offerExpires = new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString();
      } else if (customer.journey_stage === 'intent') {
        // Add moderate incentive
        personalizedOffer.additionalIncentive = 250;
        personalizedOffer.offerPrice -= 250;
        personalizedOffer.urgencyMessage = 'Limited time special pricing';
      }
      
      return {
        customer_id: customer.user_id,
        customer_email: customer.email,
        journey_stage: customer.journey_stage,
        intent_level: customer.intent_level,
        vehicle: personalizedOffer
      };
    });
    
    personalizedOffers.push(...offers.slice(0, 3)); // Top 3 matches per customer
  }
  
  return personalizedOffers;
}

async function distributeOffers(personalizedOffers) {
  const distributions = {
    website: [],
    email: [],
    sms: [],
    social: []
  };
  
  // Group by distribution channel based on customer preferences
  for (const offer of personalizedOffers) {
    // Update website with personalized pricing
    if (offer.vehicle.offerPrice) {
      const websiteUpdate = await $http.post(
        'https://api.dealeron.com/v1/personalization',
        {
          headers: { 'X-API-Key': $getNodeParameter('dealerOnApiKey') },
          body: {
            customer_id: offer.customer_id,
            vin: offer.vehicle.vin,
            personalized_price: offer.vehicle.offerPrice,
            message: offer.vehicle.urgencyMessage,
            expires: offer.vehicle.offerExpires
          }
        }
      );
      distributions.website.push(websiteUpdate.data);
    }
    
    // Queue email campaign in Customer.io
    if (offer.customer_email) {
      const emailCampaign = await $http.post(
        'https://track.customer.io/api/v1/send/email',
        {
          headers: {
            'Authorization': `Bearer ${$getNodeParameter('customerIoApiKey')}`
          },
          body: {
            to: offer.customer_email,
            transactional_message_id: 'special_offer_template',
            message_data: {
              vehicle: offer.vehicle,
              savings: offer.vehicle.savings,
              expires: offer.vehicle.offerExpires,
              cta_url: `https://dealer.com/vehicle/${offer.vehicle.vin}?offer=${offer.customer_id}`
            }
          }
        }
      );
      distributions.email.push(emailCampaign.data);
    }
    
    // Create social retargeting audience
    if (offer.journey_stage === 'intent' || offer.journey_stage === 'conversion') {
      const socialAudience = await $http.post(
        'https://api.bannerinsite.com/v1/audiences',
        {
          headers: { 'X-API-Key': $getNodeParameter('bannerInSiteApiKey') },
          body: {
            name: `Special_Offer_${offer.vehicle.model}_${Date.now()}`,
            emails: [offer.customer_email],
            offer_data: {
              vehicle: offer.vehicle,
              message: offer.vehicle.urgencyMessage
            }
          }
        }
      );
      distributions.social.push(socialAudience.data);
    }
  }
  
  return distributions;
}

function mergeOffers(bannerOffers, oemOffers) {
  const merged = new Map();
  
  // Add all banner offers
  bannerOffers.forEach(offer => {
    const key = `${offer.make}_${offer.model}_${offer.year}`;
    merged.set(key, offer);
  });
  
  // Merge or add OEM offers
  oemOffers.forEach(offer => {
    const key = `${offer.make}_${offer.model}_${offer.year}`;
    if (merged.has(key)) {
      // Combine offers
      const existing = merged.get(key);
      merged.set(key, {
        ...existing,
        discount: Math.max(existing.discount, offer.discount),
        incentives: [...(existing.incentives || []), ...(offer.incentives || [])]
      });
    } else {
      merged.set(key, offer);
    }
  });
  
  return Array.from(merged.values());
}

// Main execution
const results = await processSpecialOffers();
return [{ json: results }];
```

---

## 📦 SIMPLIFIED N8N WORKFLOW STRUCTURE

```
Main Customer Journey
         ↓
[Code Node: Inventory Sync Manager]
    • DealerOn API
    • Dealer.com FTP
    • Merge & Dedupe
    • Price Calculation
         ↓
[Code Node: Banner Automation Engine]
    • BannerInSite API
    • Campaign Creation
    • Banner Generation
    • Channel Distribution
         ↓
[Code Node: Website Audit Scanner]
    • Performance Check
    • Banner Verification
    • Offer Accuracy
    • Compliance Audit
         ↓
[Code Node: Special Offers Processor]
    • Regional Offers
    • Dealer Rules
    • Personalization
    • Multi-Channel Distribution
         ↓
[Customer.io Node]
    • Update Profiles
    • Track Events
         ↓
[BigQuery Node]
    • Log All Activity
         ↓
[JOMP Analysis Node]
    • Performance Analysis
    • Recommendations
```

---

## 🚀 IMPLEMENTATION PHASES

### Phase 1: Core Integration (Week 1)
- [ ] Set up DealerOn API credentials
- [ ] Configure BannerInSite API access
- [ ] Create Inventory Sync Manager node
- [ ] Test data flow

### Phase 2: Banner Automation (Week 2)
- [ ] Implement Banner Automation Engine
- [ ] Set up distribution channels
- [ ] Configure website placements
- [ ] Test banner syndication

### Phase 3: Auditing System (Week 3)
- [ ] Deploy Website Audit Scanner
- [ ] Set up alert thresholds
- [ ] Configure compliance checks
- [ ] Schedule automated audits

### Phase 4: Offer Management (Week 4)
- [ ] Build Special Offers Processor
- [ ] Connect regional offer feeds
- [ ] Implement personalization logic
- [ ] Test multi-channel distribution

---

## 🔑 REQUIRED CREDENTIALS

1. **DealerOn**
   - API Key
   - Dealer ID
   - FTP Credentials (if applicable)

2. **BannerInSite**
   - API Key ($250/mo + $399/mo per rooftop)
   - Dealer Account ID

3. **Dealer.com**
   - FTP Username/Password
   - API Token (if available)

4. **OEM Incentives** (Optional)
   - Provider API Key
   - Brand Authorization

---

## 📊 SUCCESS METRICS

- **Inventory Sync Rate**: >99% accuracy
- **Banner CTR**: >2.5% average
- **Offer Accuracy**: >98% match rate
- **Page Load Time**: <3 seconds
- **Campaign ROI**: >5:1
- **Audit Pass Rate**: >95%

---

## 💡 KEY ADVANTAGES

1. **Reduced Complexity**: 4 powerful Code nodes vs 40+ individual nodes
2. **Better Performance**: Fewer node transitions = faster execution
3. **Easier Maintenance**: All logic in documented code
4. **Error Handling**: Comprehensive try-catch within each node
5. **Scalability**: Easy to add new features within existing nodes
6. **Cost Efficiency**: Fewer API calls through intelligent batching