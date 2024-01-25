@foreach($components as $component)
    @if ($component)
        @include($component->view(), $component->attributes())
    @endif
@endforeach
