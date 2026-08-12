import type { ComponentProps } from 'react'
import {
  ArrowUpIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ClipboardIcon,
  Code2Icon,
  ExpandIcon,
  FileIcon,
  GlobeIcon,
  ImageIcon as LucideImageIcon,
  Loader2Icon,
  LockIcon,
  MessageSquareIcon,
  PanelLeftIcon,
  PaperclipIcon,
  PencilIcon,
  SparklesIcon,
  SquareIcon,
  TerminalSquareIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  TriangleAlertIcon,
  WandSparklesIcon,
  XIcon,
} from 'lucide-react'

type IconProps = ComponentProps<typeof XIcon>

export { ArrowUpIcon, ChevronDownIcon, FileIcon, GlobeIcon, LockIcon, PaperclipIcon, SparklesIcon }
export const CheckCircleFillIcon = (props: IconProps) => <CheckCircle2Icon {...props} />
export const CodeIcon = (props: IconProps) => <Code2Icon {...props} />
export const CopyIcon = (props: IconProps) => <ClipboardIcon {...props} />
export const CrossIcon = (props: IconProps) => <XIcon {...props} />
export const CrossSmallIcon = (props: IconProps) => <XIcon {...props} />
export const FullscreenIcon = (props: IconProps) => <ExpandIcon {...props} />
export const ImageIcon = (props: IconProps) => <LucideImageIcon {...props} />
export const LoaderIcon = (props: IconProps) => <Loader2Icon {...props} />
export const MessageIcon = (props: IconProps) => <MessageSquareIcon {...props} />
export const PencilEditIcon = (props: IconProps) => <PencilIcon {...props} />
export const SidebarLeftIcon = (props: IconProps) => <PanelLeftIcon {...props} />
export const StopIcon = (props: IconProps) => <SquareIcon {...props} />
export const SummarizeIcon = (props: IconProps) => <WandSparklesIcon {...props} />
export const TerminalWindowIcon = (props: IconProps) => <TerminalSquareIcon {...props} />
export const ThumbDownIcon = (props: IconProps) => <ThumbsDownIcon {...props} />
export const ThumbUpIcon = (props: IconProps) => <ThumbsUpIcon {...props} />
export const VercelIcon = (props: IconProps) => <SparklesIcon {...props} />
export const WarningIcon = (props: IconProps) => <TriangleAlertIcon {...props} />