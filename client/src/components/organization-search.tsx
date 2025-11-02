import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface OrganizationSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
  selectedSector: string | null;
  onSectorChange: (sector: string | null) => void;
  selectedState: string | null;
  onStateChange: (state: string | null) => void;
}

const types = ["government", "private"];
const sectors = ["banking", "telecom", "government", "education", "healthcare", "oil-gas", "other"];
const nigerianStates = [
  "Federal",
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
  "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT"
];

export function OrganizationSearch({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedSector,
  onSectorChange,
  selectedState,
  onStateChange,
}: OrganizationSearchProps) {
  const activeFiltersCount = [selectedType, selectedSector, selectedState].filter(Boolean).length;

  const clearFilters = () => {
    onTypeChange(null);
    onSectorChange(null);
    onStateChange(null);
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search organizations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-12 text-base"
          data-testid="input-search-organizations"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2" data-testid="button-filters">
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Type</DropdownMenuLabel>
            {types.map((type) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={selectedType === type}
                onCheckedChange={(checked) => onTypeChange(checked ? type : null)}
              >
                {type === "government" ? "Government" : "Private"}
              </DropdownMenuCheckboxItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Sector</DropdownMenuLabel>
            {sectors.map((sector) => (
              <DropdownMenuCheckboxItem
                key={sector}
                checked={selectedSector === sector}
                onCheckedChange={(checked) => onSectorChange(checked ? sector : null)}
              >
                {sector.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
              </DropdownMenuCheckboxItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>State</DropdownMenuLabel>
            <div className="max-h-48 overflow-y-auto">
              {nigerianStates.map((state) => (
                <DropdownMenuCheckboxItem
                  key={state}
                  checked={selectedState === state}
                  onCheckedChange={(checked) => onStateChange(checked ? state : null)}
                >
                  {state}
                </DropdownMenuCheckboxItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            data-testid="button-clear-filters"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedType && (
            <Badge variant="secondary" className="gap-1">
              Type: {selectedType === "government" ? "Government" : "Private"}
            </Badge>
          )}
          {selectedSector && (
            <Badge variant="secondary" className="gap-1">
              Sector: {selectedSector.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
            </Badge>
          )}
          {selectedState && (
            <Badge variant="secondary" className="gap-1">
              State: {selectedState}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
