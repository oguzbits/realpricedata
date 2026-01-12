#!/bin/bash

# CleverPrices Database Population Script
# Use this to trigger Keepa imports and syncs from your terminal.

# Default target
TARGET_URL="http://localhost:3000"
PRODUCTS_PER_CAT=50

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}CleverPrices Data Management Script${NC}"
echo "------------------------------------"

# Help message
show_help() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  import-all    Import Top Products (Bestsellers + Deals) for ALL categories"
    echo "  import        Import products for a specific category"
    echo "  sync          Force a price/stock sync for existing products"
    echo ""
    echo "Options:"
    echo "  --url URL     Target URL (default: http://localhost:3000)"
    echo "  --limit NUM   Products per category (default: 50)"
    echo ""
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        import-all)
            COMMAND="import-all"
            shift
            ;;
        import)
            COMMAND="import"
            CATEGORY=$2
            shift 2
            ;;
        sync)
            COMMAND="sync"
            shift
            ;;
        --url)
            TARGET_URL="$2"
            shift 2
            ;;
        --limit)
            PRODUCTS_PER_CAT="$2"
            shift 2
            ;;
        *)
            show_help
            exit 1
            ;;
    esac
done

if [ -z "$COMMAND" ]; then
    show_help
    exit 1
fi

case $COMMAND in
    import-all)
        echo -e "${GREEN}Triggering Bulk Import for all categories...${NC}"
        echo "Target: $TARGET_URL"
        echo "Products per Category: $PRODUCTS_PER_CAT"
        echo "Note: This may take a long time and might timeout on Vercel. Recommended to run against localhost."
        curl -X GET "$TARGET_URL/api/keepa/import-all?productsPerCategory=$PRODUCTS_PER_CAT"
        ;;
    import)
        if [ -z "$CATEGORY" ]; then
            echo "Error: Category slug required for 'import' command."
            exit 1
        fi
        echo -e "${GREEN}Importing products for: $CATEGORY...${NC}"
        curl -X GET "$TARGET_URL/api/keepa/import?category=$CATEGORY&limit=$PRODUCTS_PER_CAT"
        ;;
    sync)
        echo -e "${GREEN}Triggering Price/Stock Sync...${NC}"
        curl -X GET "$TARGET_URL/api/keepa/sync"
        ;;
esac

echo -e "\n${BLUE}Done.${NC}"
