import { useState } from "react";
import { Send, Users, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const CONTACTS = [
  { id: "brand-a", brand: "Brand A", name: "Constance", email: "constance@branda.com" },
  { id: "brand-b", brand: "Brand B", name: "Kate", email: "kate@brandb.com" },
  { id: "brand-c", brand: "Brand C", name: "Scott", email: "scott@brandc.com" },
  { id: "brand-d", brand: "Brand D", name: "John", email: "john@brandd.com" },
];

export interface SendLogEntry {
  id: string;
  contactName: string;
  brand: string;
  email: string;
  sentAt: string;
  subject: string;
  message: string;
}

function getSendLog(): SendLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem("sendLog") || "[]");
  } catch {
    return [];
  }
}

function saveSendLog(log: SendLogEntry[]) {
  localStorage.setItem("sendLog", JSON.stringify(log));
}

export const SendToContacts = () => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [logOpen, setLogOpen] = useState(false);
  const [sendLog, setSendLog] = useState<SendLogEntry[]>(getSendLog);

  const toggleContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleCompose = () => {
    setPopoverOpen(false);
    setComposeOpen(true);
    setMessage("");
    setSubject("");
  };

  const handleSend = () => {
    const now = new Date().toISOString();
    const newEntries: SendLogEntry[] = selectedContacts.map((id) => {
      const contact = CONTACTS.find((c) => c.id === id)!;
      return {
        id: crypto.randomUUID(),
        contactName: contact.name,
        brand: contact.brand,
        email: contact.email,
        sentAt: now,
        subject,
        message,
      };
    });

    const updatedLog = [...newEntries, ...getSendLog()];
    saveSendLog(updatedLog);
    setSendLog(updatedLog);

    toast({
      title: "Message Sent",
      description: `Email sent to ${selectedContacts.length} contact(s).`,
    });

    setComposeOpen(false);
    setSelectedContacts([]);
    setMessage("");
    setSubject("");
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs font-medium h-8 rounded-full px-4 gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Send to Contacts
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <p className="text-xs font-semibold text-foreground mb-2">Select Contacts</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm border-b border-border pb-2">
              <Checkbox
                checked={selectedContacts.length === CONTACTS.length}
                onCheckedChange={(checked) =>
                  setSelectedContacts(checked ? CONTACTS.map((c) => c.id) : [])
                }
              />
              <span className="font-semibold">Select All</span>
            </label>
            {CONTACTS.map((c) => (
              <label key={c.id} className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox
                  checked={selectedContacts.includes(c.id)}
                  onCheckedChange={() => toggleContact(c.id)}
                />
                <span className="text-muted-foreground">{c.brand}</span> – <span className="font-medium">{c.name}</span>
              </label>
            ))}
          </div>
          {selectedContacts.length > 0 && (
            <Button size="sm" className="w-full mt-3 text-xs h-8" onClick={handleCompose}>
              Compose
            </Button>
          )}
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="sm" className="text-xs font-medium h-8 rounded-full px-4 gap-1.5" onClick={() => { setSendLog(getSendLog()); setLogOpen(true); }}>
        <FileText className="h-3.5 w-3.5" />
        Send Log
      </Button>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
          </DialogHeader>
          <div className="text-xs text-muted-foreground mb-1">
            To: {selectedContacts.map((id) => { const c = CONTACTS.find((x) => x.id === id)!; return `${c.name} (${c.brand})`; }).join(", ")}
          </div>
          <Input
            placeholder="Subject line..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="text-sm"
          />
          <Textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button onClick={handleSend} disabled={!message.trim() || !subject.trim()} className="gap-1.5">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Log Dialog */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Log</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            {sendLog.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No emails sent yet.</p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {Object.values(
                  sendLog.reduce((groups, entry) => {
                    const key = `${entry.subject}|||${entry.sentAt}`;
                    if (!groups[key]) {
                      groups[key] = { subject: entry.subject, sentAt: entry.sentAt, message: entry.message, contacts: [] };
                    }
                    groups[key].contacts.push({ name: entry.contactName, brand: entry.brand, email: entry.email });
                    return groups;
                  }, {} as Record<string, { subject: string; sentAt: string; message: string; contacts: { name: string; brand: string; email: string }[] }>)
                ).map((group, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-xs py-2 hover:no-underline">
                      <div className="flex flex-col items-start gap-0.5 text-left">
                        <span className="font-semibold">{group.subject}</span>
                        <span className="text-muted-foreground font-normal">{new Date(group.sentAt).toLocaleString()}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-xs text-muted-foreground truncate mb-2">{group.message}</p>
                      <div className="pl-2 border-l-2 border-muted space-y-1">
                        {group.contacts.map((c, j) => (
                          <div key={j} className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{c.name}</span> ({c.brand}) – {c.email}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
