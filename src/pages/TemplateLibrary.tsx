import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookTemplate, Search, Download, Eye, FileText, Layers, ClipboardList, CheckCircle2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: "SAP" | "Oracle" | "Manufacturing" | "Finance" | "General";
  type: "FRD" | "BRD" | "Test Case" | "UAT Script" | "SOP" | "Data Migration" | "Go-Live Checklist";
  description: string;
  sections: string[];
  usageCount: number;
}

const templates: Template[] = [
  { id: "T01", name: "SAP FRD Template", category: "SAP", type: "FRD", description: "Functional Requirements Document following SAP methodology with process flow, gap analysis, and config specs.", sections: ["Executive Summary", "Business Process Overview", "Functional Requirements", "Gap Analysis", "Configuration Specs", "Integration Points", "Data Migration", "Test Scenarios", "Sign-off"], usageCount: 24 },
  { id: "T02", name: "Oracle FRD Template", category: "Oracle", type: "FRD", description: "Oracle Cloud-style FRD with setup workbooks, personalization specs, and extension design.", sections: ["Scope & Objectives", "Current State Analysis", "Future State Design", "Setup Workbook", "Personalization Specs", "Extension Design", "Reports & Analytics", "Security Requirements", "Approval"], usageCount: 18 },
  { id: "T03", name: "Manufacturing BRD", category: "Manufacturing", type: "BRD", description: "Business Requirements Document for manufacturing modules covering shop floor, BOM, routing, and WIP.", sections: ["Business Context", "Stakeholders", "Production Requirements", "BOM & Routing", "Shop Floor Control", "Quality Integration", "Costing", "KPIs & Metrics"], usageCount: 12 },
  { id: "T04", name: "Finance BRD Template", category: "Finance", type: "BRD", description: "Finance module BRD covering GL, AP, AR, FA, and statutory compliance.", sections: ["Chart of Accounts", "GL Requirements", "AP Process", "AR Process", "Fixed Assets", "Tax & Statutory", "Period Close", "Financial Reports"], usageCount: 15 },
  { id: "T05", name: "UAT Script Template", category: "General", type: "UAT Script", description: "Structured UAT script with test scenarios, steps, expected results, and sign-off.", sections: ["Test Scenario ID", "Prerequisite", "Test Steps", "Expected Results", "Actual Results", "Status", "Defect Reference", "Tester Sign-off"], usageCount: 32 },
  { id: "T06", name: "SAP Test Case Template", category: "SAP", type: "Test Case", description: "SAP-style unit and integration test case template with transaction codes.", sections: ["Test Case ID", "Module/Transaction", "Prerequisite Data", "Steps", "Expected Output", "Pass/Fail", "Screenshots", "Comments"], usageCount: 28 },
  { id: "T07", name: "Data Migration Template", category: "General", type: "Data Migration", description: "Data migration mapping document with source-target field mapping, transformation rules.", sections: ["Source System", "Target Table", "Field Mapping", "Data Type", "Transformation Rule", "Validation Rule", "Default Value", "Migration Sequence"], usageCount: 20 },
  { id: "T08", name: "Go-Live Checklist", category: "General", type: "Go-Live Checklist", description: "Comprehensive go-live readiness checklist covering cutover, rollback, and support.", sections: ["Cutover Activities", "Data Migration Status", "User Training Status", "Security Setup", "Integration Testing", "Performance Testing", "Rollback Plan", "Support Plan", "Sign-off Matrix"], usageCount: 10 },
  { id: "T09", name: "Manufacturing SOP", category: "Manufacturing", type: "SOP", description: "Standard Operating Procedure template for manufacturing processes and shop floor operations.", sections: ["Purpose", "Scope", "Responsibilities", "Procedure Steps", "Screenshots", "Exception Handling", "Related Documents", "Revision History"], usageCount: 22 },
  { id: "T10", name: "Oracle Data Migration", category: "Oracle", type: "Data Migration", description: "Oracle FBDI-style data migration template with file-based data import specs.", sections: ["FBDI Template Name", "Source Mapping", "Lookup Values", "Data Transformation", "Validation Checks", "Error Handling", "Load Sequence", "Verification Queries"], usageCount: 14 },
];

const catColors: Record<string, string> = {
  SAP: "bg-blue-500/15 text-blue-700 border-blue-200",
  Oracle: "bg-red-500/15 text-red-700 border-red-200",
  Manufacturing: "bg-emerald-500/15 text-emerald-700 border-emerald-200",
  Finance: "bg-amber-500/15 text-amber-700 border-amber-200",
  General: "bg-muted text-muted-foreground border-border",
};

export default function TemplateLibrary() {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [preview, setPreview] = useState<Template | null>(null);

  const categories = [...new Set(templates.map((t) => t.category))];
  const filtered = templates.filter((t) => {
    const ms = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.type.toLowerCase().includes(search.toLowerCase());
    const mc = filterCat === "all" || t.category === filterCat;
    return ms && mc;
  });

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookTemplate size={24} className="text-primary" />
          Standard Template Library
        </h1>
        <p className="text-sm text-muted-foreground">Pre-built SAP, Oracle, and industry templates — Select a template when creating forms or documentation</p>
      </div>

      {/* Category Filter + Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFilterCat("all")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterCat === "all" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            All ({templates.length})
          </button>
          {categories.map((c) => (
            <button key={c} onClick={() => setFilterCat(c)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterCat === c ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {c} ({templates.filter((t) => t.category === c).length})
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[180px] max-w-xs ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tmpl) => (
          <Card key={tmpl.id} className="border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-semibold text-foreground">{tmpl.name}</CardTitle>
                <Badge variant="outline" className={`text-[10px] ${catColors[tmpl.category]}`}>{tmpl.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant="secondary" className="text-[10px]">{tmpl.type}</Badge>
              <p className="text-xs text-muted-foreground line-clamp-2">{tmpl.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <ClipboardList size={10} />
                  {tmpl.sections.length} sections · {tmpl.usageCount} uses
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setPreview(tmpl)}>
                    <Eye size={12} /> Preview
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                    <Download size={12} /> Use
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              {preview?.name}
            </DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-xs ${catColors[preview.category]}`}>{preview.category}</Badge>
                <Badge variant="secondary" className="text-xs">{preview.type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{preview.description}</p>
              <div>
                <div className="text-xs font-semibold text-foreground mb-2">Template Sections:</div>
                <div className="space-y-1">
                  {preview.sections.map((section, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                      <CheckCircle2 size={12} className="text-success shrink-0" />
                      <span className="text-sm">{i + 1}. {section}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button className="w-full gap-2"><Download size={14} /> Use This Template</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
