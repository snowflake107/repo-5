@foreach($components as $component)
    @include($component->view(), $component->attributes())
@endforeach
