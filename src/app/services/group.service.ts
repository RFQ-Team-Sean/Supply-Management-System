// src/app/services/group.service.ts

import { Injectable } from '@angular/core';
import { z } from 'zod';

export const groupSchema = z.object({
  id: z.string().length(32, "ID must be exactly 32 characters").optional(),
  name: z.string().min(1, "Group name is required"),
  description: z.string().max(500).optional(),
  products: z.array(z.string()).optional(),
});

export type Group = z.infer<typeof groupSchema>;

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private readonly STORAGE_KEY = 'groups';
  private groups: Group[] = [];

  constructor() {
    this.loadFromLocalStorage();
    if (!this.groups.length) {
      this.loadDummyData();
    }
  }

  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.groups = JSON.parse(stored);
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.groups));
  }

  private generate32CharId(): string {
    return Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  private loadDummyData(): void {
    const dummy: Group[] = [
      {
        id: '12345678901234567890123456789012',
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        products: [
          '12345678901234567890123456789012',
          '23456789012345678901234567890123',
          '56789012345678901234567890123456'
        ]
      },
      {
        id: '23456789012345678901234567890123',
        name: 'Furniture',
        description: 'Office furniture and equipment',
        products: [
          '34567890123456789012345678901234',
          '67890123456789012345678901234567'
        ]
      },
      {
        id: '34567890123456789012345678901234',
        name: 'Accessories',
        description: 'Computer and desk accessories',
        products: [
          '45678901234567890123456789012345',
          '78901234567890123456789012345678'
        ]
      }
    ];
    this.groups = dummy;
    this.saveToLocalStorage();
  }

  async getAllGroups(): Promise<Group[]> {
    return this.groups;
  }

  async addGroup(data: Omit<Group, 'id'>): Promise<void> {
    const newItem: Group = {
      ...data,
      id: this.generate32CharId()
    };
    groupSchema.parse(newItem);
    this.groups.push(newItem);
    this.saveToLocalStorage();
  }

  async updateGroup(group: Group): Promise<void> {
    groupSchema.parse(group);
    const index = this.groups.findIndex(g => g.id === group.id);
    if (index === -1) {
      throw new Error('Group not found');
    }
    this.groups[index] = group;
    this.saveToLocalStorage();
  }

  async deleteGroup(id: string): Promise<void> {
    this.groups = this.groups.filter(g => g.id !== id);
    this.saveToLocalStorage();
  }

  async getGroupById(id: string): Promise<Group | undefined> {
    return this.groups.find(group => group.id === id);
  }
}