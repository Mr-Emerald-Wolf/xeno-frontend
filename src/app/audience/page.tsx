"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { AlertCircle, ChevronDown, ChevronUp, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";

type Condition = {
  field: string;
  operator: string;
  value: string;
};

type Customer = {
  id: number;
  name: string;
  email: string;
  totalSpending: string;
  createdAt: string;
  updatedAt: string;
};

type SegmentData = {
  id: number;
  name: string;
  conditions: {
    operator: "AND" | "OR";
    conditions: Condition[];
  };
  createdAt: string;
  updatedAt: string;
  customers: Customer[];
};

const fieldOptions = [
  { value: "totalSpending", label: "Total Spending" },
  { value: "visits", label: "Number of Visits" },
  { value: "lastVisit", label: "Last Visit" },
] as const;

const operatorOptions = {
  totalSpending: [
    { value: ">", label: ">" },
    { value: "<", label: "<" },
    { value: "=", label: "=" },
    { value: ">=", label: ">=" },
    { value: "<=", label: "<=" },
  ],
  visits: [
    { value: ">", label: ">" },
    { value: "<", label: "<" },
    { value: "=", label: "=" },
    { value: ">=", label: ">=" },
    { value: "<=", label: "<=" },
  ],
  lastVisit: [
    { value: ">", label: "More than" },
    { value: "<", label: "Less than" },
    { value: "=", label: "Exactly" },
  ],
} as const;

function formatCondition(condition: Condition) {
  const fieldLabel =
    fieldOptions.find((f) => f.value === condition.field)?.label ??
    condition.field;
  const operatorLabel =
    operatorOptions[condition.field as keyof typeof operatorOptions]?.find(
      (o) => o.value === condition.operator,
    )?.label ?? condition.operator;
  return `${fieldLabel} ${operatorLabel} ${condition.value}`;
}

export default function AudienceSegments() {
  const [segments, setSegments] = useState<SegmentData[]>([]);
  const [newSegment, setNewSegment] = useState<SegmentData>({
    id: 0,
    name: "",
    conditions: {
      operator: "AND",
      conditions: [{ field: "totalSpending", operator: ">", value: "" }],
    },
    createdAt: "",
    updatedAt: "",
    customers: [],
  });
  const [audienceSize, setAudienceSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openSegments, setOpenSegments] = useState<Record<number, boolean>>({});

  const fetchSegments = async () => {
    try {
      const response = await axios.get<{
        message: string;
        segments: Array<
          Omit<SegmentData, "conditions"> & { conditions: string }
        >;
      }>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/audience/all`);

      const parsedSegments = response.data.segments.map((segment) => ({
        ...segment,
        conditions: JSON.parse(segment.conditions) as SegmentData["conditions"],
      }));

      setSegments(parsedSegments);
    } catch (err) {
      console.error("Error fetching segments:", err);
      setError("Failed to fetch existing segments. Please try again.");
    }
  };

  useEffect(() => {
    void fetchSegments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/audience`,
        newSegment,
      );
      void fetchSegments();
      setNewSegment({
        id: 0,
        name: "",
        conditions: {
          operator: "AND",
          conditions: [{ field: "totalSpending", operator: ">", value: "" }],
        },
        createdAt: "",
        updatedAt: "",
        customers: [],
      });
      setAudienceSize(null);
      setError(null);
    } catch (err) {
      console.error("Error creating segment:", err);
      setError("Failed to create segment. Please try again.");
    }
  };

  const handleConditionChange = (
    index: number,
    field: keyof Condition,
    value: string,
  ) => {
    setNewSegment((prevSegment) => {
      const updatedConditions = [...prevSegment.conditions.conditions];
      updatedConditions[index] = {
        ...updatedConditions[index],
        [field]: value,
      } as Condition;

      if (field === "field") {
        updatedConditions[index] = {
          ...updatedConditions[index],
          operator:
            operatorOptions[value as keyof typeof operatorOptions][0].value,
          value: "",
        };
      }

      return {
        ...prevSegment,
        conditions: {
          ...prevSegment.conditions,
          conditions: updatedConditions,
        },
      };
    });
  };

  const addCondition = () => {
    setNewSegment((prevSegment) => ({
      ...prevSegment,
      conditions: {
        ...prevSegment.conditions,
        conditions: [
          ...prevSegment.conditions.conditions,
          { field: "totalSpending", operator: ">", value: "" },
        ],
      },
    }));
  };

  const calculateAudienceSize = async () => {
    try {
      const response = await axios.post<{ size: { audienceSize: number } }>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/audience/size`,
        newSegment,
      );
      setAudienceSize(response.data.size.audienceSize);
      setError(null);
    } catch (err) {
      console.error("Error calculating audience size:", err);
      setError("Failed to calculate audience size. Please try again.");
    }
  };

  const toggleSegment = (id: number) => {
    setOpenSegments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Audience Segments</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Segment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Segment Name"
              value={newSegment.name}
              onChange={(e) =>
                setNewSegment((prev) => ({ ...prev, name: e.target.value }))
              }
              className="mb-2"
            />
            <Select
              value={newSegment.conditions.operator}
              onValueChange={(value: "AND" | "OR") =>
                setNewSegment((prev) => ({
                  ...prev,
                  conditions: { ...prev.conditions, operator: value },
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">AND</SelectItem>
                <SelectItem value="OR">OR</SelectItem>
              </SelectContent>
            </Select>
            {newSegment.conditions.conditions.map((condition, index) => (
              <div
                key={index}
                className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0"
              >
                <Select
                  value={condition.field}
                  onValueChange={(value) =>
                    handleConditionChange(index, "field", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={condition.operator}
                  onValueChange={(value) =>
                    handleConditionChange(index, "operator", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {operatorOptions[
                      condition.field as keyof typeof operatorOptions
                    ]?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Value"
                  value={condition.value}
                  onChange={(e) =>
                    handleConditionChange(index, "value", e.target.value)
                  }
                  className="flex-grow"
                />
              </div>
            ))}
            <Button type="button" onClick={addCondition} variant="outline">
              Add Condition
            </Button>
            <Button
              type="button"
              onClick={calculateAudienceSize}
              variant="secondary"
              className="w-full"
            >
              Calculate Audience Size
            </Button>
            {audienceSize !== null && (
              <div className="text-center font-semibold">
                Estimated Audience Size: {audienceSize.toLocaleString()}
              </div>
            )}
            <Button type="submit" className="w-full">
              Create Segment
            </Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="mb-4 text-xl font-semibold">Existing Segments</h2>
      <div className="space-y-4">
        {segments.map((segment) => (
          <Card key={segment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{segment.name}</CardTitle>
                <Badge variant="secondary">
                  <Users className="mr-1 h-3 w-3" />
                  {segment.customers.length} customers
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-medium">
                    Conditions ({segment.conditions.operator})
                  </h3>
                  <ul className="text-muted-foreground list-inside list-disc space-y-1">
                    {segment.conditions.conditions.map((condition, index) => (
                      <li key={index}>{formatCondition(condition)}</li>
                    ))}
                  </ul>
                </div>

                {segment.customers.length > 0 && (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => toggleSegment(segment.id)}
                      >
                        {openSegments[segment.id] ? (
                          <ChevronUp className="mr-2 h-4 w-4" />
                        ) : (
                          <ChevronDown className="mr-2 h-4 w-4" />
                        )}
                        {openSegments[segment.id] ? "Hide" : "Show"} Customers
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="bg-muted/50 rounded-md border p-4">
                        <ul className="space-y-2">
                          {segment.customers.map((customer) => (
                            <li key={customer.id} className="text-sm">
                              {customer.name}
                              <span className="text-muted-foreground">
                                {" "}
                                ({customer.email})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
