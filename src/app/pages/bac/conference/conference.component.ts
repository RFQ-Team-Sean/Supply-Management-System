// conference.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { EditorModule } from 'primeng/editor';
import { CrudService } from 'src/app/services/crud.service';
import { PPMPProject, Users, ConferenceEvent, Invitation } from 'src/app/schema/schema';

@Component({
  selector: 'app-conference',
  standalone: true,
  imports: [
    CardModule,
    InputTextModule,
    ButtonModule,
    MultiSelectModule,
    ToastModule,
    MenuModule,
    DividerModule,
    DialogModule,
    FormsModule,
    DropdownModule,
    CommonModule,
    TabViewModule,
    CalendarModule,
    TooltipModule,
    SkeletonModule,
    EditorModule,
  ],
  templateUrl: './conference.component.html',
  styleUrls: ['./conference.component.scss'],
  providers: [MessageService],
})
export class ConferenceComponent implements OnInit {
  preProcurementEvents: ConferenceEvent[] = [];
  preBiddingEvents: ConferenceEvent[] = [];
  preProcurementInvitations: Invitation[] = [];
  preBiddingInvitations: Invitation[] = [];

  activeTabIndex: number = 0;

  availableEvents: ConferenceEvent[] = [];
  eventModal: boolean = false;
  inviteModal: boolean = false;
  editEventModal: boolean = false;

  eventDate: Date | null = null;
  eventTime: Date | null = null;
  selectedMode: string = '';
  selectedPlatform: string | null = null;
  selectedPPMPProject: PPMPProject | null = null;
  selectedParticipants: Users[] = [];
  selectedEvent: ConferenceEvent | null = null;

  editInviteModal: boolean = false; 
  selectedInvite: Invitation | null = null;
  meetingMinutes: string = '';

  purchaseRequests: string = '';

  meetMode: { name: string; code: string }[] = [];
  platformsByMode: { [key: string]: { name: string; code: string }[] } = {};
  participants: Users[] = [];
  ppmpProjectList: PPMPProject[] = [];

  isLoadingEvents: boolean = true;
  isLoadingInvitations: boolean = true;
  loadingTime: number | null = null;

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  deleteConfirmationModal: boolean = false;
  itemToDelete: ConferenceEvent | Invitation | null = null;

  constructor(
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private crudService: CrudService
  ) {}

  async ngOnInit() {
    this.meetMode = [
      { name: 'Online', code: 'Online' },
      { name: 'In-Person', code: 'In-Person' },
      { name: 'Hybrid', code: 'Hybrid' },
    ];
    this.platformsByMode = {
      Online: [
        { name: 'Google Meet', code: 'Google Meet' },
        { name: 'Zoom', code: 'Zoom' },
      ],
      'In-Person': [],
      Hybrid: [
        { name: 'Google Meet', code: 'Google Meet' },
        { name: 'Zoom', code: 'Zoom' },
      ],
    };

    try {
      const startTime = performance.now();
      this.isLoadingEvents = true; 
      this.isLoadingInvitations = true;
      this.ppmpProjectList = await this.crudService.getAll<PPMPProject>(PPMPProject);
      this.participants = await this.crudService.getAll<Users>(Users);
      const allEvents = await this.crudService.getAll<ConferenceEvent>(ConferenceEvent);
      const allInvitations = await this.crudService.getAll<Invitation>(Invitation);

      await this.delay(2000);

      console.log('PPMP Project List:', this.ppmpProjectList);
      console.log('All Events:', allEvents);
      console.log('All Invitations:', allInvitations);

      this.preProcurementEvents = allEvents.filter((e) => e.type === 'PreProcurement');
      this.preBiddingEvents = allEvents.filter((e) => e.type === 'PreBidding');
      this.preProcurementInvitations = allInvitations.filter((i) => i.type === 'PreProcurement');
      this.preBiddingInvitations = allInvitations.filter((i) => i.type === 'PreBidding');

      console.log('PreProcurement Events:', this.preProcurementEvents);
      console.log('PreBidding Events:', this.preBiddingEvents);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load events.' });
    } finally {
      this.isLoadingEvents = false;
      this.isLoadingInvitations = false;
      this.cdr.detectChanges(); // Ensure UI updates
    }

    this.selectedPPMPProject = this.ppmpProjectList[0] || null;
    this.selectedMode = 'Online';
    this.selectedPlatform = this.getPlatformsForSelectedMode()[0]?.code || null;
  }

  getPPMPProjectTitle(ppmpId: string): string {
    return this.ppmpProjectList.find((p) => p.id === ppmpId)?.project_title || 'Unknown Project';
  }

  // New method to calculate card width based on project title length
  getCardWidth(ppmpId: string): string {
    const title = this.getPPMPProjectTitle(ppmpId);
    const baseWidth = 10; // Minimum width in rem
    const charWidth = 0.5; // Additional width per character in rem
    const calculatedWidth = baseWidth + (title.length * charWidth);
    return `${Math.min(calculatedWidth, 30)}rem`; // Cap at 30rem to avoid overly wide cards
  }

  onModeChange(event: any) {
    this.selectedMode = event.value;
    this.selectedPlatform = this.selectedMode === 'In-Person' ? null : this.getPlatformsForSelectedMode()[0]?.code || null;
  }

  onPPMPChange(event: any) {
    this.selectedPPMPProject = event.value;
    this.purchaseRequests = this.selectedPPMPProject ? 'Sample Request' : '';
  }

  onEventSelect(event: any, context: string) {
    if (context === 'edit') {
      this.selectedEvent = event as ConferenceEvent;
      if (this.selectedEvent) {
        this.eventDate = new Date(this.selectedEvent.date);
        this.eventTime = new Date(this.selectedEvent.event_time);
        this.selectedMode = this.selectedEvent.mode;
        this.selectedPlatform = this.selectedEvent.platform || null;
        this.selectedPPMPProject = this.selectedEvent ? this.ppmpProjectList.find((p) => p.id === this.selectedEvent!.ppmp_id) || null : null;
        this.purchaseRequests = 'Sample Request'; // Placeholder
        this.editEventModal = true;
      } else {
        console.error('Selected event is null in edit context');
      }
    } else if (context === 'invite') {
      this.selectedEvent = event.value as ConferenceEvent;
      if (this.selectedEvent) {
        this.eventDate = new Date(this.selectedEvent.date);
        this.eventTime = new Date(this.selectedEvent.event_time);
      } else {
        console.error('Selected event is null in invite context');
        this.eventDate = null;
        this.eventTime = null;
      }
    }
  }

  getParticipantName(participantId: string): string {
    const participant = this.participants.find(p => p.id === participantId);
    return participant ? participant.fullname : 'Unknown';
  }

  getAllParticipantNames(participantIds: string[]): string {
    return participantIds
      .map(id => this.getParticipantName(id))
      .filter(name => name !== 'Unknown') // Optional: filter out unknown names
      .join(', ');
  }

  async saveEditedEvent() {
    if (!this.selectedEvent || !this.eventDate || !this.eventTime || !this.selectedPPMPProject) {
      this.messageService.add({ severity: 'warn', summary: 'Missing Fields', detail: 'Please fill in all required fields.' });
      return;
    }

    const updatedEvent: ConferenceEvent = {
      ...this.selectedEvent,
      ppmp_id: this.selectedPPMPProject.id,
      date: this.eventDate,
      event_time: this.eventTime,
      mode: this.selectedMode as 'Online' | 'InPerson' | 'Hybrid',
      platform: this.selectedMode === 'In-Person' ? undefined : (this.selectedPlatform || undefined),
      type: this.selectedEvent.type,
      created_by: this.selectedEvent.created_by,
      created_at: this.selectedEvent.created_at,
    };

    await this.crudService.update<ConferenceEvent>(ConferenceEvent, updatedEvent.id, updatedEvent);
    this.updateEventArrays(updatedEvent);

    this.messageService.add({ severity: 'success', summary: 'Event Updated', detail: 'Event updated successfully.' });
    this.editEventModal = false;
  }

  getPlatformsForSelectedMode() {
    return this.platformsByMode[this.selectedMode] || [];
  }

  addEvent(tabIndex: number) {
    this.activeTabIndex = tabIndex;
    this.eventDate = null;
    this.eventTime = null;
    this.selectedMode = 'Online';
    this.selectedPlatform = this.getPlatformsForSelectedMode()[0]?.code || null;
    this.selectedPPMPProject = null;
    // this.selectedPPMPProject = this.selectedEvent ? this.ppmpProjectList.find((p) => p.ppmp_id === this.selectedEvent!.ppmp_id) || null : null;     
    this.purchaseRequests = '';
    this.eventModal = true;
  }

  createInvite(tabIndex: number) {
    this.activeTabIndex = tabIndex;
    this.availableEvents = tabIndex === 0 ? this.preProcurementEvents : this.preBiddingEvents;
    this.selectedEvent = null;
    this.eventDate = null;
    this.eventTime = null;
    this.selectedParticipants = [];
    this.inviteModal = true;
  }

  async saveEvent() {
    if (!this.eventDate || !this.selectedMode || !this.selectedPPMPProject || !this.eventTime) {
      this.messageService.add({ severity: 'warn', summary: 'Missing Fields', detail: 'Please fill in all required fields.' });
      return;
    }

    const newEvent: ConferenceEvent = {
      id: `${Date.now()}`, // Ensure unique ID
      ppmp_id: this.selectedPPMPProject.id,
      date: this.eventDate,
      event_time: this.eventTime,
      mode: this.selectedMode as 'Online' | 'InPerson' | 'Hybrid',
      platform: this.selectedMode === 'In-Person' ? undefined : (this.selectedPlatform || undefined),
      type: this.activeTabIndex === 0 ? 'PreProcurement' : 'PreBidding',
      created_by: '1', // Adjust based on auth
      created_at: new Date(),
    };

    try {
+      await this.crudService.create<ConferenceEvent>(ConferenceEvent, newEvent);
      // Sync with backend instead of manual array update
      const allEvents = await this.crudService.getAll<ConferenceEvent>(ConferenceEvent);

      this.preProcurementEvents = allEvents.filter((e) => e.type === 'PreProcurement');
      this.preBiddingEvents = allEvents.filter((e) => e.type === 'PreBidding');
      this.messageService.add({ severity: 'success', summary: 'Event Saved', detail: 'Event saved successfully.' });
    } catch (error) {
      console.error('Failed to create event:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save event.' });
    } finally {
      this.cdr.detectChanges();
    }
    this.eventModal = false;
  }

  async sendInvite() {
    if (!this.selectedEvent || !this.eventTime || !this.selectedParticipants.length) {
      this.messageService.add({ severity: 'warn', summary: 'Missing Fields', detail: 'Please select an event, time, and participants.' });
      return;
    }

    const newInvitation: Invitation = {
      id: `${Date.now()}`,
      event_id: this.selectedEvent.id,
      ppmp_id: this.selectedEvent.ppmp_id,
      date: this.selectedEvent.date,
      time: this.eventTime,
      mode: this.selectedEvent.mode,
      platform: this.selectedEvent.platform,
      participants: this.selectedParticipants.map((p) => p.id),
      type: this.activeTabIndex === 0 ? 'PreProcurement' : 'PreBidding',
      sent_by: '1',
      sent_at: new Date(),
    };

    try {
      await this.crudService.create<Invitation>(Invitation, newInvitation);
      // Sync with backend
      const allInvitations = await this.crudService.getAll<Invitation>(Invitation);
      this.preProcurementInvitations = allInvitations.filter((i) => i.type === 'PreProcurement');
      this.preBiddingInvitations = allInvitations.filter((i) => i.type === 'PreBidding');
      this.messageService.add({ severity: 'success', summary: 'Invitation Sent', detail: 'Invitation sent successfully.' });
    } catch (error) {
      console.error('Failed to create invitation:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to send invitation.' });
    }
    this.inviteModal = false;
    this.cdr.detectChanges();
  }

  async onMinutesChange(minutes: string) {
    if (!this.selectedInvite) {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Error', 
        detail: 'No invitation selected' 
      });
      return;
    }

    try {
      const updatedInvite: Invitation = {
        ...this.selectedInvite,
        minutes: minutes
      };

      // Save immediately when content changes
      await this.crudService.update<Invitation>(
        Invitation,
        updatedInvite.id,
        updatedInvite
      );

      this.updateInviteArrays(updatedInvite);
      
      // Update the selected invite to reflect the saved changes
      this.selectedInvite = updatedInvite;

      this.messageService.add({ 
        severity: 'success', 
        summary: 'Minutes Updated', 
        detail: 'Meeting minutes saved successfully' 
      });
    } catch (error) {
      console.error('Failed to save minutes:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to save meeting minutes' 
      });
    }
  }

  editInvite(invite: Invitation) {
    this.selectedInvite = { ...invite };
    this.eventDate = new Date(this.selectedInvite.date);
    this.eventTime = new Date(this.selectedInvite.time);
    this.selectedEvent = this.availableEvents.find((e) => e.id === this.selectedInvite!.event_id) || null;
    this.selectedParticipants = this.participants.filter((p) => this.selectedInvite!.participants.includes(p.id));
    this.meetingMinutes = this.selectedInvite.minutes || '';
    this.editInviteModal = true;
  }
  
  async saveEditedInvite() {
    if (!this.selectedInvite) {
      this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'No invitation selected' });
      return;
    }

    try {
      if (!this.eventDate || !this.eventTime) {
        this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Date and time are required' });
        return;
      }
  
      const updatedInvite: Invitation = {
        ...this.selectedInvite,
        date: this.eventDate,
        time: this.eventTime,
        participants: this.selectedParticipants.map(p => p.id),
        minutes: this.meetingMinutes  
      };

      await this.crudService.update<Invitation>(
        Invitation,
        updatedInvite.id,
        updatedInvite
      );

      this.updateInviteArrays(updatedInvite);

      this.messageService.add({ 
        severity: 'success', 
        summary: 'Invitation Updated', 
        detail: 'Invitation updated successfully' 
      });

      this.editInviteModal = false;
      this.selectedInvite = null;
      this.meetingMinutes = '';
    } catch (error) {
      console.error('Failed to save invitation:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Failed to update invitation' 
      });
    }
  }

  hasMinutes(invite: Invitation): boolean {
    return !!invite.minutes && invite.minutes.trim().length > 0;
  }  

  updateInviteArrays(updatedInvite: Invitation) {
    const indexPreProc = this.preProcurementInvitations.findIndex(i => i.id === updatedInvite.id);
    if (indexPreProc !== -1) {
      this.preProcurementInvitations[indexPreProc] = { ...updatedInvite }; // Ensure a fresh copy
      this.preProcurementInvitations = [...this.preProcurementInvitations]; // Trigger change detection
    }
    const indexPreBid = this.preBiddingInvitations.findIndex(i => i.id === updatedInvite.id);
    if (indexPreBid !== -1) {
      this.preBiddingInvitations[indexPreBid] = { ...updatedInvite }; // Ensure a fresh copy
      this.preBiddingInvitations = [...this.preBiddingInvitations]; // Trigger change detection
    }
  }

  onTabChange(event: any) {
    this.activeTabIndex = event.index;
    this.cdr.detectChanges();
  }

  private updateEventArrays(event: ConferenceEvent) {
    if (event.type === 'PreProcurement') {
      const index = this.preProcurementEvents.findIndex((e) => e.id === event.id);
      if (index >= 0) {
        this.preProcurementEvents[index] = event;
        this.preProcurementEvents = [...this.preProcurementEvents];
      } else {
        this.preProcurementEvents = [...this.preProcurementEvents, event];
      }
    } else {
      const index = this.preBiddingEvents.findIndex((e) => e.id === event.id);
      if (index >= 0) {
        this.preBiddingEvents[index] = event;
        this.preBiddingEvents = [...this.preBiddingEvents];
      } else {
        this.preBiddingEvents = [...this.preBiddingEvents, event];
      }
    }
  }

  deleteItem( item: ConferenceEvent | Invitation ) {
    this.itemToDelete = item;
    this.deleteConfirmationModal = true;
  }
  
  async confirmDeleteItem() {
    if (!this.itemToDelete) return;

    try {
      const startTime = performance.now();
      if ('event_id' in this.itemToDelete) {
        const invitation = this.itemToDelete as Invitation;
        await this.crudService.delete<Invitation>(Invitation, invitation.id);
        const allInvitations = await this.crudService.getAll<Invitation>(Invitation);

        this.preProcurementInvitations = allInvitations.filter((i) => i.type === 'PreProcurement');
        this.preBiddingInvitations = allInvitations.filter((i) => i.type === 'PreBidding');
        this.messageService.add({ severity: 'success', summary: 'Invitation Deleted', detail: 'The invitation was successfully deleted.' });
        this.editInviteModal = false;
        this.selectedInvite = null;
      } else {
        const event = this.itemToDelete as ConferenceEvent;
        await this.crudService.delete<ConferenceEvent>(ConferenceEvent, event.id);
        const allEvents = await this.crudService.getAll<ConferenceEvent>(ConferenceEvent);

        this.preProcurementEvents = allEvents.filter((e) => e.type === 'PreProcurement');
        this.preBiddingEvents = allEvents.filter((e) => e.type === 'PreBidding');
        this.messageService.add({ severity: 'success', summary: 'Event Deleted', detail: 'The event was successfully deleted.' });
        this.editEventModal = false;
        this.selectedEvent = null;
      }
        const endTime = performance.now();
        this.loadingTime = endTime - startTime;
        console.log(`Deletion took ${this.loadingTime.toFixed(2)} ms`);
      } catch (error) {
        console.error('Deletion failed:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete item.' });
      } finally {
        this.cdr.detectChanges();
      }

      // Reset state
      this.deleteConfirmationModal = false;
      this.itemToDelete = null;
      this.eventDate = null;
      this.eventTime = null;
      this.selectedMode = 'Online';
      this.selectedPlatform = null;
      this.selectedPPMPProject = null;
      this.purchaseRequests = '';
      this.selectedParticipants = [];
  }

  // private updateEventArraysAfterDelete(event: ConferenceEvent) {
  //   if (event.type === 'PreProcurement') {
  //     this.preProcurementEvents = this.preProcurementEvents.filter((e) => e.id !== event.id);
  //   } else {
  //     this.preBiddingEvents = this.preBiddingEvents.filter((e) => e.id !== event.id);
  //   }
  //   this.availableEvents = [...this.preProcurementEvents, ...this.preBiddingEvents];
  // }
  
  // Add update for invitations
  // private updateInvitationArraysAfterDelete(invite: Invitation) {
  //   if (invite.type === 'PreProcurement') {
  //     this.preProcurementInvitations = this.preProcurementInvitations.filter((i) => i.id !== invite.id);
  //   } else {
  //     this.preBiddingInvitations = this.preBiddingInvitations.filter((i) => i.id !== invite.id);
  //   }
  // }
  
}

