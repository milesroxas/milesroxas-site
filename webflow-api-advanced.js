// Webflow API Advanced Integration Example
// This script demonstrates more advanced operations with the Webflow API
// including working with collection items and updating page content

// Required dependencies:
// npm install node-fetch dotenv

require('dotenv').config()
const fetch = require('node-fetch')

// Base URL for Webflow API
const API_BASE_URL = 'https://api.webflow.com'

// Your Webflow API token should be stored in a .env file
const API_TOKEN = process.env.WEBFLOW_API_TOKEN

// API headers for authorization
const headers = {
  Authorization: `Bearer ${API_TOKEN}`,
  'accept-version': '1.0.0',
  'Content-Type': 'application/json',
}

// Site and collection IDs (from your Miles Roxas site)
const SITE_ID = '64c6d35c1257dfdf4b20a056' // Miles Roxas site
const ALOQUEN_COLLECTION_ID = '65ff41d3378d84ed95e5dd24' // Aloquen collection

// Main function to run examples
async function main() {
  try {
    // Example 1: Get collection details
    console.log(`Fetching collection details for ID: ${ALOQUEN_COLLECTION_ID}`)
    const collection = await getCollection(ALOQUEN_COLLECTION_ID)
    console.log(`Collection: ${collection.displayName}`)

    // Example 2: List collection items
    console.log('\nFetching collection items...')
    const items = await listCollectionItems(ALOQUEN_COLLECTION_ID)
    console.log(`Found ${items.length} items`)

    // Display collection items
    items.forEach((item) => {
      console.log(`- ${item.fieldData.name} (${item.fieldData.slug})`)
      if (item.fieldData.gallery && item.fieldData.gallery.length) {
        console.log(`  Has ${item.fieldData.gallery.length} gallery images`)
      }
    })

    // Example 3: Create a new collection item (commented out to prevent accidental creation)
    /*
    console.log('\nCreating a new collection item...');
    const newItemData = {
      items: [
        {
          fieldData: {
            name: 'New Direction Example',
            slug: 'new-direction-example',
            gallery: [
              {
                url: 'https://uploads-ssl.webflow.com/64cbad92fb5f6ca7009eaa17/65ff41ec6aa0de9555a1affd_sas-Aloquen-VisualDirections-Presentation_Page_01.jpg',
                alt: 'Example image'
              }
            ]
          }
        }
      ]
    };
    
    const newItem = await createCollectionItem(ALOQUEN_COLLECTION_ID, newItemData);
    console.log('New item created:', newItem);
    */

    // Example 4: Update a collection item (commented out to prevent accidental updates)
    /*
    if (items.length > 0) {
      const itemToUpdate = items[0];
      console.log(`\nUpdating collection item: ${itemToUpdate.fieldData.name}`);
      
      const updateData = {
        items: [
          {
            id: itemToUpdate.id,
            fieldData: {
              name: `${itemToUpdate.fieldData.name} (Updated)`,
              slug: itemToUpdate.fieldData.slug
            }
          }
        ]
      };
      
      const updatedItem = await updateCollectionItem(ALOQUEN_COLLECTION_ID, updateData);
      console.log('Item updated:', updatedItem);
    }
    */

    // Example 5: Get page content
    console.log('\nFetching page content...')
    // Using the Aloquen page ID from your site
    const PAGE_ID = '65fa03cca04159b6905566e0'
    const pageContent = await getPageContent(PAGE_ID)
    console.log(`Page has ${pageContent.nodes.length} content nodes`)

    // Find text nodes
    const textNodes = pageContent.nodes.filter((node) => node.type === 'text')
    console.log(`Found ${textNodes.length} text nodes`)

    // Display first 3 text nodes
    console.log('\nSample text nodes:')
    textNodes.slice(0, 3).forEach((node) => {
      console.log(`- Node ID: ${node.id}`)
      console.log(
        `  Text: ${node.text.text.substring(0, 50)}${node.text.text.length > 50 ? '...' : ''}`,
      )
    })

    // Example 6: Update page content (commented out to prevent accidental updates)
    /*
    console.log('\nUpdating page content...');
    
    // Find a specific text node to update
    const nodeToUpdate = textNodes.find(node => 
      node.text.text.includes('The client was an organization')
    );
    
    if (nodeToUpdate) {
      const updateContentData = {
        localeId: null, // Use default locale
        nodes: [
          {
            nodeId: nodeToUpdate.id,
            text: 'The client was an innovative organization that provided cutting-edge solutions for the healthcare industry. They were looking to pivot their business and relaunch as a completely new company.'
          }
        ]
      };
      
      await updatePageContent(PAGE_ID, updateContentData);
      console.log('Page content updated successfully');
    }
    */

    // Example 7: Publishing collection items (commented out to prevent accidental publishing)
    /*
    if (items.length > 0) {
      console.log('\nPublishing collection items...');
      const itemIds = items.slice(0, 2).map(item => item.id);
      
      await publishCollectionItems(ALOQUEN_COLLECTION_ID, itemIds);
      console.log('Collection items published successfully');
    }
    */
  } catch (error) {
    console.error('Error:', error.message)
    if (error.response) {
      const errorText = await error.response.text()
      console.error('API Error:', errorText)
    }
  }
}

// Function to get collection details
async function getCollection(collectionId) {
  const response = await fetch(`${API_BASE_URL}/collections/${collectionId}`, { headers })
  return response.json()
}

// Function to list collection items
async function listCollectionItems(collectionId, options = {}) {
  const queryParams = new URLSearchParams({
    limit: options.limit || 100,
    offset: options.offset || 0,
  }).toString()

  const response = await fetch(`${API_BASE_URL}/collections/${collectionId}/items?${queryParams}`, {
    headers,
  })
  const data = await response.json()
  return data.items || []
}

// Function to create a new collection item
async function createCollectionItem(collectionId, bodyData) {
  const response = await fetch(`${API_BASE_URL}/collections/${collectionId}/items`, {
    method: 'POST',
    headers,
    body: JSON.stringify(bodyData),
  })

  return response.json()
}

// Function to update a collection item
async function updateCollectionItem(collectionId, bodyData) {
  const response = await fetch(`${API_BASE_URL}/collections/${collectionId}/items`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(bodyData),
  })

  return response.json()
}

// Function to get page content
async function getPageContent(pageId) {
  const response = await fetch(`${API_BASE_URL}/pages/${pageId}/content`, { headers })
  return response.json()
}

// Function to update page content
async function updatePageContent(pageId, bodyData) {
  const response = await fetch(`${API_BASE_URL}/pages/${pageId}/content`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(bodyData),
  })

  return response.json()
}

// Function to publish collection items
async function publishCollectionItems(collectionId, itemIds) {
  const response = await fetch(`${API_BASE_URL}/collections/${collectionId}/items/publish`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ itemIds }),
  })

  return response.json()
}

// Run the main function
main().catch(console.error)
