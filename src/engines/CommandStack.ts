/**
 * CommandStack - Undo/redo system for actions
 * Implements the Command pattern for reversible operations
 */

export interface Command {
  /**
   * Execute the command
   * @returns Promise that resolves when command is executed
   */
  execute(): Promise<void> | void;

  /**
   * Undo the command
   * @returns Promise that resolves when command is undone
   */
  undo(): Promise<void> | void;

  /**
   * Optional description of the command
   */
  description?: string;

  /**
   * Optional timestamp of when command was executed
   */
  timestamp?: Date;
}

export interface CommandStackOptions {
  /**
   * Maximum number of commands to keep in history
   * @default 50
   */
  maxSize?: number;

  /**
   * Callback when stack changes
   */
  onChange?: () => void;
}

/**
 * Command Stack for undo/redo operations
 * Manages a history of reversible commands
 */
export class CommandStack {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxSize: number;
  private onChange?: () => void;

  /**
   * Create a new command stack
   * @param options Configuration options
   */
  constructor(options: CommandStackOptions = {}) {
    this.maxSize = options.maxSize ?? 50;
    this.onChange = options.onChange;
  }

  /**
   * Execute a command and add it to the undo stack
   * @param command Command to execute
   * @returns Promise that resolves when command is executed
   */
  async execute(command: Command): Promise<void> {
    // Execute the command
    await command.execute();

    // Add timestamp
    command.timestamp = new Date();

    // Add to undo stack
    this.undoStack.push(command);

    // Clear redo stack (can't redo after new action)
    this.redoStack = [];

    // Trim stack if needed
    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift();
    }

    // Notify listeners
    this.notifyChange();
  }

  /**
   * Undo the last command
   * @returns Promise that resolves when command is undone, or false if nothing to undo
   */
  async undo(): Promise<boolean> {
    if (!this.canUndo()) {
      return false;
    }

    const command = this.undoStack.pop()!;
    
    try {
      await command.undo();
      this.redoStack.push(command);
      this.notifyChange();
      return true;
    } catch (error) {
      // If undo fails, put command back
      this.undoStack.push(command);
      throw error;
    }
  }

  /**
   * Redo the last undone command
   * @returns Promise that resolves when command is redone, or false if nothing to redo
   */
  async redo(): Promise<boolean> {
    if (!this.canRedo()) {
      return false;
    }

    const command = this.redoStack.pop()!;
    
    try {
      await command.execute();
      this.undoStack.push(command);
      this.notifyChange();
      return true;
    } catch (error) {
      // If redo fails, put command back
      this.redoStack.push(command);
      throw error;
    }
  }

  /**
   * Check if undo is available
   * @returns True if there are commands to undo
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   * @returns True if there are commands to redo
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notifyChange();
  }

  /**
   * Get the number of commands in undo stack
   */
  undoCount(): number {
    return this.undoStack.length;
  }

  /**
   * Get the number of commands in redo stack
   */
  redoCount(): number {
    return this.redoStack.length;
  }

  /**
   * Get description of the next undo command
   */
  getUndoDescription(): string | undefined {
    if (this.undoStack.length === 0) {
      return undefined;
    }
    return this.undoStack[this.undoStack.length - 1].description;
  }

  /**
   * Get description of the next redo command
   */
  getRedoDescription(): string | undefined {
    if (this.redoStack.length === 0) {
      return undefined;
    }
    return this.redoStack[this.redoStack.length - 1].description;
  }

  /**
   * Get all undo descriptions (most recent first)
   */
  getUndoHistory(): string[] {
    return this.undoStack
      .slice()
      .reverse()
      .map(cmd => cmd.description ?? 'Unknown action');
  }

  /**
   * Get all redo descriptions (most recent first)
   */
  getRedoHistory(): string[] {
    return this.redoStack
      .slice()
      .reverse()
      .map(cmd => cmd.description ?? 'Unknown action');
  }

  /**
   * Notify listeners of stack change
   */
  private notifyChange(): void {
    if (this.onChange) {
      this.onChange();
    }
  }
}

/**
 * Composite command - executes multiple commands as one
 */
export class CompositeCommand implements Command {
  private commands: Command[];
  public description?: string;

  constructor(commands: Command[], description?: string) {
    this.commands = commands;
    this.description = description;
  }

  async execute(): Promise<void> {
    for (const command of this.commands) {
      await command.execute();
    }
  }

  async undo(): Promise<void> {
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      await this.commands[i].undo();
    }
  }
}

/**
 * Function command - wraps execute/undo functions
 */
export class FunctionCommand implements Command {
  private executeFunc: () => Promise<void> | void;
  private undoFunc: () => Promise<void> | void;
  public description?: string;

  constructor(
    executeFunc: () => Promise<void> | void,
    undoFunc: () => Promise<void> | void,
    description?: string
  ) {
    this.executeFunc = executeFunc;
    this.undoFunc = undoFunc;
    this.description = description;
  }

  async execute(): Promise<void> {
    await this.executeFunc();
  }

  async undo(): Promise<void> {
    await this.undoFunc();
  }
}
