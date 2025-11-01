/**
 * Check detailed license information for a specific license ID
 * Usage: npx tsx scripts/check-license-details.ts [licenseTermsId]
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const STORY_API_BASE_URL = process.env.NEXT_PUBLIC_STORY_API_URL || 'https://api.storyapis.com/api/v4';
const STORY_API_KEY = process.env.STORY_API_KEY || '';

async function checkLicenseDetails(licenseTermsId: string) {
  console.log('\n📜 Checking License Terms Details\n');
  console.log('='.repeat(80));
  console.log(`License Terms ID: ${licenseTermsId}`);
  console.log('='.repeat(80));

  try {
    console.log('\n📋 Fetching license details from Story Protocol API...\n');

    const response = await fetch(`${STORY_API_BASE_URL}/licenses/${licenseTermsId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': STORY_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    console.log('✅ License found!');
    console.log('\nLicense Details:');
    console.log(JSON.stringify(data, null, 2));

    if (data.data) {
      const license = data.data;
      console.log('\n📊 Key Properties:');
      console.log(`   Transferable: ${license.transferable ?? 'Unknown'}`);
      console.log(`   Commercial Use: ${license.commercialUse ?? 'Unknown'}`);
      console.log(`   Derivatives Allowed: ${license.derivativesAllowed ?? 'Unknown'}`);
      console.log(`   Derivatives Approval: ${license.derivativesApproval ?? 'Not required'}`);
      console.log(`   Derivatives Attribution: ${license.derivativesAttribution ?? 'Not required'}`);
      console.log(`   Derivatives Reciprocal: ${license.derivativesReciprocal ?? 'Not required'}`);
      console.log(`   Commercial Rev Share: ${license.commercialRevShare ?? 0}%`);
      console.log(`   Commercial Revenue Ceiling: ${license.commercialRevCeling ?? 'None'}`);
      console.log(`   URI: ${license.uri ?? 'None'}`);

      console.log('\n');
      console.log('='.repeat(80));

      if (license.derivativesAllowed) {
        console.log('\n✅ This license ALLOWS derivatives!');

        if (license.derivativesApproval) {
          console.log('⚠️  WARNING: Derivatives require approval from the licensor.');
          console.log('   You may not be able to create remixes automatically.');
        } else {
          console.log('✅ No approval required - derivatives can be created freely.');
        }

        if (license.derivativesReciprocal) {
          console.log('📝 NOTE: Derivatives must use the same license terms (reciprocal).');
        }
      } else {
        console.log('\n❌ This license does NOT allow derivatives!');
        console.log('   You cannot create remixes with this license.');
      }
    }

  } catch (error: any) {
    console.error('\n❌ Error fetching license details:', error.message);

    if (error.message.includes('404')) {
      console.log('\n💡 The license ID may not exist or may not be indexed yet.');
      console.log('   Try checking the Story Protocol explorer or documentation.');
    }

    console.error('\nFull error:', error);
  }
}

const licenseTermsId = process.argv[2] || '28272';
checkLicenseDetails(licenseTermsId).catch(console.error);
