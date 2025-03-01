import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Lock, EyeOff } from "lucide-react";

interface PrivacySelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function PrivacySelect({ value, onValueChange }: PrivacySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select privacy level" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="public" className="flex items-center">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>Public</span>
          </div>
          <span className="text-xs text-muted-foreground ml-2">
            Visible to everyone
          </span>
        </SelectItem>
        <SelectItem value="private">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>Private</span>
          </div>
          <span className="text-xs text-muted-foreground ml-2">
            Visible to members only
          </span>
        </SelectItem>
        <SelectItem value="secret">
          <div className="flex items-center gap-2">
            <EyeOff className="h-4 w-4" />
            <span>Secret</span>
          </div>
          <span className="text-xs text-muted-foreground ml-2">
            Hidden from non-members
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
