
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ShareLinkProps {
  link: string;
}

const ShareLink: React.FC<ShareLinkProps> = ({ link }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying manually",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-2xl flex gap-2 items-center">
      <div className="flex-1 relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Link className="w-4 h-4 text-gray-500" />
        </div>
        <Input
          value={link}
          readOnly
          className="pl-10"
        />
      </div>
      <Button onClick={handleCopy} variant="outline">
        {copied ? "Copied!" : "Copy"}
      </Button>
    </div>
  );
};

export default ShareLink;
