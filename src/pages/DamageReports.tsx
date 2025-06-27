import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import {
  DamageReport,
  DamageReportStatus,
  DamageReportFormValues,
} from "@/types/damage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DamageReports = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [reports, setReports] = useState<DamageReport[]>([
    {
      id: "1",
      title: "Broken Window",
      description: "A window was broken during a storm.",
      damage_date: "2024-01-20",
      estimated_cost: 500,
      property_id: "A123",
      assigned_to: "John Doe",
      status: "pending",
    },
    {
      id: "2",
      title: "Leaky Faucet",
      description: "A faucet is leaking in the bathroom.",
      damage_date: "2024-01-22",
      estimated_cost: 50,
      property_id: "B456",
      assigned_to: "Jane Smith",
      status: "investigating",
    },
    {
      id: "3",
      title: "Cracked Tiles",
      description: "Some tiles are cracked in the kitchen.",
      damage_date: "2024-01-25",
      estimated_cost: 200,
      property_id: "C789",
      assigned_to: "John Doe",
      status: "resolved",
    },
  ]);
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateNew = () => {
    setSelectedReport(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditReport = (report: DamageReport) => {
    setSelectedReport(report);
    setIsEditDialogOpen(true);
  };

  const handleDeleteReport = (report: DamageReport) => {
    setSelectedReport(report);
    setIsDeleteDialogOpen(true);
  };

  const handleStatusChange = (reportId: string, status: DamageReportStatus) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === reportId ? { ...report, status } : report
      )
    );
  };

  const handleFormSubmit = async (formData: DamageReportFormValues) => {
    try {
      const reportData = {
        ...formData,
        damage_date: formData.damage_date,
        estimated_cost: formData.estimated_cost || 0,
      };

      if (selectedReport) {
        setReports((prevReports) =>
          prevReports.map((report) =>
            report.id === selectedReport.id ? { ...report, ...reportData } : report
          )
        );
        toast.success("Report updated successfully");
      } else {
        const newReport: DamageReport = {
          id: Date.now().toString(),
          ...reportData,
          status: "pending",
        };
        setReports((prevReports) => [...prevReports, newReport]);
        toast.success("Report created successfully");
      }

      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      setSelectedReport(null);
    } catch (error) {
      toast.error("Failed to save report");
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedReport) {
      try {
        setReports((prevReports) =>
          prevReports.filter((report) => report.id !== selectedReport.id)
        );
        toast.success("Report deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedReport(null);
      } catch (error) {
        toast.error("Failed to delete report");
      }
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Damage Reports - Arivia Villa Sync</title>
      </Helmet>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="md:text-3xl font-bold tracking-tight flex items-center text-xl px-0 mx-0 text-left">
              Damage Reports
            </h1>
            <p className="text-sm text-muted-foreground tracking-tight py-0 px-0 mx-0">
              View and manage damage reports
            </p>
          </div>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DamageReportList
            reports={reports}
            onSelectReport={setSelectedReport}
            onEditReport={handleEditReport}
            onDeleteReport={handleDeleteReport}
            onStatusChange={handleStatusChange}
          />
        </div>

        {selectedReport && (
          <div className="lg:col-span-1">
            <DamageReportDetails report={selectedReport} />
          </div>
        )}
      </div>

      <ReportFormDialog
        isOpen={isCreateDialogOpen || isEditDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedReport(null);
        }}
        onSubmit={handleFormSubmit}
        report={selectedReport}
      />

      <DeleteReportDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedReport(null);
        }}
        onConfirm={handleDeleteConfirm}
        reportName={selectedReport?.title || ""}
      />
    </div>
  );
};

interface DamageReportListProps {
  reports: DamageReport[];
  onSelectReport: (report: DamageReport) => void;
  onEditReport: (report: DamageReport) => void;
  onDeleteReport: (report: DamageReport) => void;
  onStatusChange: (reportId: string, status: DamageReportStatus) => void;
}

const DamageReportList: React.FC<DamageReportListProps> = ({
  reports,
  onSelectReport,
  onEditReport,
  onDeleteReport,
  onStatusChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Damage Reports</CardTitle>
        <CardDescription>List of all damage reports</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {reports.length > 0 ? (
          reports.map((report) => (
            <DamageReportItem
              key={report.id}
              report={report}
              onSelect={onSelectReport}
              onEdit={onEditReport}
              onDelete={onDeleteReport}
              onStatusChange={onStatusChange}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No damage reports found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface DamageReportItemProps {
  report: DamageReport;
  onSelect: (report: DamageReport) => void;
  onEdit: (report: DamageReport) => void;
  onDelete: (report: DamageReport) => void;
  onStatusChange: (reportId: string, status: DamageReportStatus) => void;
}

const DamageReportItem: React.FC<DamageReportItemProps> = ({
  report,
  onSelect,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  return (
    <div className="border rounded-md p-4 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
      <div className="flex justify-between items-center">
        <div onClick={() => onSelect(report)}>
          <h3 className="font-semibold">{report.title}</h3>
          <p className="text-sm text-muted-foreground">{report.description}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(report)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(report)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <StatusDropdown
                reportId={report.id}
                currentStatus={report.status}
                onStatusChange={onStatusChange}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-2 flex items-center space-x-2">
        <Badge variant="secondary">{report.property_id}</Badge>
        <Badge>{report.assigned_to}</Badge>
      </div>
    </div>
  );
};

interface StatusDropdownProps {
  reportId: string;
  currentStatus: DamageReportStatus;
  onStatusChange: (reportId: string, status: DamageReportStatus) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  reportId,
  currentStatus,
  onStatusChange,
}) => {
  const statuses: DamageReportStatus[] = [
    "pending",
    "investigating",
    "resolved",
    "compensation_required",
    "compensation_paid",
    "closed",
    "disputed",
  ];

  return (
    <Select onValueChange={(value) => onStatusChange(reportId, value as DamageReportStatus)} defaultValue={currentStatus}>
      <SelectTrigger>
        <SelectValue placeholder="Update Status" />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

interface DamageReportDetailsProps {
  report: DamageReport;
}

const DamageReportDetails: React.FC<DamageReportDetailsProps> = ({
  report,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Details</CardTitle>
        <CardDescription>Details of the selected damage report</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-bold">Title</h4>
          <p>{report.title}</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold">Description</h4>
          <p>{report.description}</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold">Damage Date</h4>
          <p>{report.damage_date}</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold">Estimated Cost</h4>
          <p>${report.estimated_cost}</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold">Property ID</h4>
          <p>{report.property_id}</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold">Assigned To</h4>
          <p>{report.assigned_to}</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold">Status</h4>
          <Badge>{report.status}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

interface ReportFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: DamageReportFormValues) => void;
  report: DamageReport | null;
}

const ReportFormDialog: React.FC<ReportFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  report,
}) => {
  const [formData, setFormData] = useState<DamageReportFormValues>({
    title: report?.title || "",
    description: report?.description || "",
    damage_date: report?.damage_date || format(new Date(), "yyyy-MM-dd"),
    estimated_cost: report?.estimated_cost || 0,
    property_id: report?.property_id || "",
    assigned_to: report?.assigned_to || "",
  });
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  React.useEffect(() => {
    if (report) {
      setFormData({
        title: report.title || "",
        description: report.description || "",
        damage_date: report.damage_date || format(new Date(), "yyyy-MM-dd"),
        estimated_cost: report.estimated_cost || 0,
        property_id: report.property_id || "",
        assigned_to: report.assigned_to || "",
      });
    }
  }, [report]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {report ? "Edit Report" : "Create New Report"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {report
              ? "Update the details of the damage report."
              : "Enter the details for the new damage report."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="damage_date" className="text-right">
                Damage Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] pl-3 text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    {date ? (
                      format(date, "yyyy-MM-dd")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      setDate(date);
                      setFormData((prevData) => ({
                        ...prevData,
                        damage_date: format(date as Date, "yyyy-MM-dd"),
                      }));
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="estimated_cost" className="text-right">
                Estimated Cost
              </Label>
              <Input
                type="number"
                id="estimated_cost"
                name="estimated_cost"
                value={formData.estimated_cost}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="property_id" className="text-right">
                Property ID
              </Label>
              <Input
                type="text"
                id="property_id"
                name="property_id"
                value={formData.property_id}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assigned_to" className="text-right">
                Assigned To
              </Label>
              <Input
                type="text"
                id="assigned_to"
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button type="submit">{report ? "Update" : "Create"}</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface DeleteReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reportName: string;
}

const DeleteReportDialog: React.FC<DeleteReportDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  reportName,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the{" "}
            {reportName} report from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DamageReports;
