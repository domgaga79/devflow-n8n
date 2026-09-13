import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import {
  describe,
  beforeEach,
  expect,
  it,
} from 'vitest';

import {
  RiskBadge,
} from './risk-badge';

describe('RiskBadge', () => {
  let fixture:
    ComponentFixture<RiskBadge>;

  let component:
    RiskBadge;

  beforeEach(
    async () => {
      await TestBed
        .configureTestingModule({
          imports: [
            RiskBadge,
          ],
        })
        .compileComponents();

      fixture =
        TestBed.createComponent(
          RiskBadge,
        );

      component =
        fixture.componentInstance;
    },
  );

  it('deve criar o componente', () => {
    expect(component)
      .toBeTruthy();
  });

  it('deve normalizar HIGH para high', () => {
    fixture.componentRef
      .setInput(
        'level',
        'HIGH',
      );

    fixture.detectChanges();

    expect(
      component
        .normalizedLevel(),
    ).toBe('high');

    expect(
      fixture
        .nativeElement
        .textContent,
    ).toContain('high');
  });

  it('deve usar unknown quando não houver risco', () => {
    fixture.componentRef
      .setInput(
        'level',
        null,
      );

    fixture.detectChanges();

    expect(
      component
        .normalizedLevel(),
    ).toBe('unknown');
  });
});