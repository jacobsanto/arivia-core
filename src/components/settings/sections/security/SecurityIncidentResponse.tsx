import React, { useState } from "react";
import { AlertTriangle, Clock, User, Shield, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";

const SecurityIncidentResponse: React.FC = () => {
  const { logSecurityEvent } = useSecurityMonitoring();
  const [incidentReport, setIncidentReport] = useState("");

  const incidentTypes = [
    {
      type: "data_breach",
      severity: "critical" as const,
      title: "Data Breach",
      description: "Unauthorized access to sensitive data",
      icon: Shield,
      color: "text-red-600"
    },
    {
      type: "suspicious_login",
      severity: "high" as const,
      title: "Suspicious Login",
      description: "Login from unusual location or device",
      icon: User,
      color: "text-orange-600"
    },
    {
      type: "system_anomaly",
      severity: "medium" as const,
      title: "System Anomaly",
      description: "Unusual system behavior detected",
      icon: AlertTriangle,
      color: "text-yellow-600"
    },
    {
      type: "failed_authentication",
      severity: "low" as const,
      title: "Failed Authentication",
      description: "Multiple failed login attempts",
      icon: Clock,
      color: "text-blue-600"
    }
  ];

  const handleLogIncident = async (type: string, severity: "low" | "medium" | "high" | "critical") => {
    try {
      await logSecurityEvent(type, severity, {
        manual_report: true,
        report_details: incidentReport,
        timestamp: new Date().toISOString()
      });
      setIncidentReport("");
    } catch (error) {
      console.error("Failed to log incident:", error);
    }
  };

  const responseProtocol = {
    critical: [
      "1. Immediately isolate affected systems",
      "2. Notify security team and stakeholders",
      "3. Document all evidence",
      "4. Begin containment procedures",
      "5. Contact legal and compliance teams"
    ],
    high: [
      "1. Assess scope and impact",
      "2. Notify security team",
      "3. Monitor for escalation",
      "4. Implement mitigation measures",
      "5. Document incident details"
    ],
    medium: [
      "1. Investigate the incident",
      "2. Monitor system behavior",
      "3. Apply security patches if needed",
      "4. Update security policies"
    ],
    low: [
      "1. Log incident for analysis",
      "2. Monitor for patterns",
      "3. Review access logs",
      "4. Update monitoring rules"
    ]
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Security Incident Response
          </CardTitle>
          <CardDescription>
            Quick response tools for security incidents and threats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Incident Report</label>
              <Textarea
                placeholder="Describe the security incident in detail..."
                value={incidentReport}
                onChange={(e) => setIncidentReport(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incidentTypes.map((incident) => {
                const IconComponent = incident.icon;
                return (
                  <Card key={incident.type} className="border">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className={`h-5 w-5 ${incident.color}`} />
                          <div>
                            <h4 className="font-medium">{incident.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {incident.description}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={incident.severity === 'critical' ? 'destructive' : 'secondary'}
                          className="ml-2"
                        >
                          {incident.severity}
                        </Badge>
                      </div>
                      <Button
                        className="w-full mt-3"
                        variant={incident.severity === 'critical' ? 'destructive' : 'outline'}
                        onClick={() => handleLogIncident(incident.type, incident.severity)}
                        disabled={!incidentReport.trim()}
                      >
                        Log {incident.title}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Response Protocols
          </CardTitle>
          <CardDescription>
            Standard operating procedures for different incident severities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(responseProtocol).map(([severity, steps]) => (
              <div key={severity}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge 
                    variant={severity === 'critical' ? 'destructive' : 'secondary'}
                    className="capitalize"
                  >
                    {severity} Severity
                  </Badge>
                </div>
                <div className="pl-4 border-l-2 border-muted">
                  <ol className="space-y-2">
                    {steps.map((step, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center mt-0.5">
                          {index + 1}
                        </span>
                        {step.substring(3)} {/* Remove the number prefix */}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Contacts</CardTitle>
          <CardDescription>Key personnel for security incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Security Team Lead</h4>
              <p className="text-sm text-muted-foreground">security@arivia.com</p>
              <p className="text-sm text-muted-foreground">+30 xxx xxx xxxx</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">IT Administrator</h4>
              <p className="text-sm text-muted-foreground">admin@arivia.com</p>
              <p className="text-sm text-muted-foreground">+30 xxx xxx xxxx</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Legal Department</h4>
              <p className="text-sm text-muted-foreground">legal@arivia.com</p>
              <p className="text-sm text-muted-foreground">+30 xxx xxx xxxx</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Management</h4>
              <p className="text-sm text-muted-foreground">management@arivia.com</p>
              <p className="text-sm text-muted-foreground">+30 xxx xxx xxxx</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityIncidentResponse;