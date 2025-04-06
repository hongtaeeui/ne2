"use client";

import * as React from "react";
import Link from "next/link";
import { IconArrowRight, IconChevronRight, IconClipboard, IconDeviceFloppy } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface Specification {
  name: string;
  value: string;
}

export interface SubpartPreviewData {
  id: string;
  name: string;
  description: string;
  status: "completed" | "in-progress" | "pending";
  specifications: Specification[];
  completionRate: number;
  modelId: string;
  modelName?: string;
}

interface SubpartPreviewModalProps {
  subpart: SubpartPreviewData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (subpartId: string, newStatus: "completed" | "in-progress" | "pending") => void;
}

export function SubpartPreviewModal({ subpart, open, onOpenChange, onStatusChange }: SubpartPreviewModalProps) {
  const [status, setStatus] = React.useState<"completed" | "in-progress" | "pending">("pending");

  React.useEffect(() => {
    if (subpart) {
      setStatus(subpart.status);
    }
  }, [subpart]);

  const handleStatusChange = (value: string) => {
    setStatus(value as "completed" | "in-progress" | "pending");
  };

  const handleSave = () => {
    if (subpart && onStatusChange) {
      onStatusChange(subpart.id, status);
      onOpenChange(false);
    }
  };

  if (!subpart) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{subpart.name}</DialogTitle>
          <DialogDescription>{subpart.description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">상태</h4>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">완료됨</SelectItem>
                <SelectItem value="in-progress">진행중</SelectItem>
                <SelectItem value="pending">대기중</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-medium">완료율</h4>
            <div className="flex items-center gap-2">
              <Progress value={subpart.completionRate} className="h-2" />
              <span className="text-sm font-medium">{subpart.completionRate}%</span>
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-medium mb-2">주요 정보</h4>
              <div className="space-y-2">
                {subpart.specifications.slice(0, 3).map((spec, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{spec.name}:</span>
                    <span className="font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row">
          <Button size="sm" className="w-full sm:w-auto" variant="outline" asChild>
            <Link href={`/inspection/${subpart.modelId}/${subpart.id}`}>
              <IconClipboard className="mr-2 h-4 w-4" />
              전체 검사 항목 보기
              <IconChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          {onStatusChange && (
            <Button size="sm" className="w-full sm:w-auto" onClick={handleSave}>
              <IconDeviceFloppy className="mr-2 h-4 w-4" />
              상태 저장
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
